import {
  getApp,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  getFirestore,
  createUserWithEmailAndPassword,
  getFunctions,
  httpsCallable,
  messaging,
  runTransaction,
  arrayUnion,
  arrayRemove,
  FieldValue,
  firestore,
  Timestamp,
  FirebaseAuthTypes,
} from "../TaskKeeper-mobile/exportedModules.js";
import { platform } from "./shared";
import { Task, Subtask, Project, Release, User, Notification, AuthenticationUser } from "./firebaseTypes";

const app = getApp(); // gets config from google-services.json
const auth = getAuth();
const db = getFirestore(app);
app.firestore().settings({
  persistence: true,
});
const functions = getFunctions();

// TODO: DEV-ONLY! remove these lines when deploying to production
auth.useEmulator("http://localhost:9099");
db.useEmulator("localhost", 8080);
functions.useEmulator("localhost", 5001);
//consolye.log(db.collection("users"))

const someSharedFunction = () => {
  console.log(`Called from shared function! Project type: ${platform}`);
};

const logInWithPassword = async (email: AuthenticationUser["email"], password: AuthenticationUser["password"]) => {
  if (email === "" || password === "") {
    throw "email or password is empty!";
  }
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("lougged the fuck in! logged in user:" + userCredential.user);
    })
    .catch((error) => {
      console.log("error during login!: " + error.code + ", " + error.message);
    });
};

const logOutUser = async () => {
  return signOut(auth)
    .then(() => {
      console.log("logout successful!");
    })
    .catch((error) => {
      console.log("something went uh-oh during logging out! oopsie woopsie! >w< " + error);
    });
};

const checkUserStatus = async () => {
  console.log("current user email: " + JSON.stringify(auth.currentUser));
  const fcm_token = await messaging().getToken();
  console.log("current fcm_token: " + JSON.stringify(fcm_token));
  return JSON.stringify(auth.currentUser);
};

const checkUserLoginStatus = (nextOrObserver) => {
  return auth.onAuthStateChanged(nextOrObserver);
};

// TODO: change 'extraData' here to instead explicitly specify what other variables what we're expecting to get
// TODO: check if there's a better way of doing this cross-module (auth&firestore) user account creation """transaction"""
const signUpUser = async (email: AuthenticationUser["email"], password: AuthenticationUser["password"], extraData: { [key: string]: any }) => {
  let user: FirebaseAuthTypes.UserCredential | null = null;
  try {
    if (!email || !password) {
      throw new Error("Missing email or password.");
    }
    extraData["fcm_token"] = await messaging().getToken();
    // Step 1: Create user in Auth
    user = await auth.createUserWithEmailAndPassword(email, password);
    const user_uid = user.user.uid;

    // Step 2: Create user record in Firestore
    await db
      .collection("users")
      .doc(user_uid)
      .set({
        ...extraData,
        created_on: Timestamp.now(),
        last_updated_on: Timestamp.now(),
      });

    logInWithPassword(email, password);
    return { success: true, uid: user_uid };
  } catch (error) {
    console.error("Error creating user:", error);
    // Rollback: If the Firestore write fails after creating the Auth user, delete the Auth user.
    if (user) {
      try {
        await user.user.delete();
        console.log("Rolled back auth user creation due to Firestore error.");
      } catch (deleteError) {
        console.error("Failed to rollback auth user:", deleteError);
      }
    }
    throw Error("Error creating new user: " + error);
  }
};

// NOTE: this is a cloud function because it involves password generation, which is safer handled on the server
// TODO: consider writing a separate onTrigger daily/weekly/monthly function for regenerating invite codes. users with invite code permissions should be able to see the remaining time until the invite code expires
const createProject = async (name: Project["name"], description: Project["description"], githubUrl: Project["github_url"]) => {
  try {
    const currentUser = auth.currentUser;
    console.log("currentUser:", currentUser);
    if (currentUser) {
      const uid = currentUser.uid;
      const createProjectFunction = functions.httpsCallable("createProject");
      const result = await createProjectFunction({ name, description, githubUrl, uid });
      console.log(result);
    } else {
      console.error("createProject - logged-in user not found!");
    }
  } catch (error) {
    console.error("Error creating new project:", error);
    throw error;
  }
};

const refreshProjectInviteCode = async (projectId: Project["id"]) => {
  try {
    const currentUser = auth.currentUser;
    console.log("currentUser:", currentUser);
    if (currentUser) {
      const uid = currentUser.uid;
      const createProjectFunction = functions.httpsCallable("refreshProjectInviteCode");
      const result = await createProjectFunction({ projectId });
      console.log(result);
    } else {
      console.error("createProject - logged-in user not found!");
    }
  } catch (error) {
    console.error("Error creating new project:", error);
    throw error;
  }
};

const editProject = async (projectId: Project["id"], name: Project["name"], description: Project["description"], githubUrl: Project["github_url"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const last_updated_on: Project["last_updated_on"] = Timestamp.now();
      await db
        .collection("projects")
        .doc(projectId)
        .update({
          name,
          description,
          github_url: githubUrl,
          last_updated_on,
        })
        .then((res) => {
          console.log("editProject response: ", res);
          return { success: true, projectData: { name: name, description: description, githubUrl: githubUrl, lastUpdatedOn: last_updated_on } };
        });
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error editing project:", error);
    throw error;
  }
};

const removeUserFromProject = async (projectId: Project["id"], userId: User["id"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await db
        .collection("projects")
        .doc(projectId)
        .update({
          [`members.${userId}`]: firestore.FieldValue.delete(), // Deletes the userId key
        })
        .then(() => {
          console.log("success removing user from project!");
        });
    }
  } catch (error) {
    console.error("Error removing user from project!:", error);
    throw error;
  }
};

const deleteProject = async (projectId: Project["id"]) => {
  try {
    // NOTE: batch deletes are limited to 500 writes, so only 499 tasks.
    // this should be fine for now but should be re-considered for future scalability
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const batch = db.batch();
    const projectRef = db.collection("projects").doc(projectId);
    const tasksSnapshot = await db.collection("tasks").where("project_id", "==", projectId).get();

    // Add each task deletion to the batch
    tasksSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the project itself
    batch.delete(projectRef);

    // Commit the batch (atomic operation)
    await batch.commit();

    console.log("Project and all associated tasks deleted successfully.");
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

const loadUserProjects = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error("User not authenticated");
    }

    const userProjects = await db.collection("projects").where(`members.${uid}`, "!=", null).get();
    const userProjectsData = userProjects.docs.map((doc) => {
      const data = doc.data();
      return {
        projectId: doc.id,
        name: data.name,
        description: data.description,
        githubUrl: data.github_url,
        members: data.members,
        userPermissions: data.members[uid],
        lastUpdatedOn: data.last_updated_on,
        inviteCode: data.invite_code,
      };
    });
    console.log("success loading user projects!:", userProjectsData);
    return userProjectsData;

    // const getUserProjectsFunction = functions.httpsCallable("getUserProjects");
    // const result = await getUserProjectsFunction({ uid });
    // console.log("success loading user projects!:", result);
    // return result.data;
  } catch (error) {
    console.error("Error loading user projects!:", error);
    throw error;
  }
};

const loadUserTasks = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userUid = currentUser.uid;
      const userTasks = await db.collection("tasks").where("assigned_user_uid", "==", userUid).get();

      const userTasksData = userTasks.docs.map((doc) => {
        const data = doc.data();
        return {
          taskId: doc.id,
          releaseId: data.release_id,
          projectId: data.project_id,
          taskName: data.task_name,
          taskDescription: data.task_description,
          priorityLevel: data.priority_level,
          taskType: data.task_type,
          subtasks: data.subtasks,
          taskStatus: data.task_status,
          taskAssigneeUid: data.task_assignee_uid,
          createdOn: data.created_on,
          lastUpdatedOn: data.last_updated_on,
        };
      });

      console.log("Success loading user tasks:", userTasksData);
      return await userTasksData;
    }
  } catch (error) {
    console.error("Error loading user tasks!");
    throw error;
  }
};

const loadReleaseTasks = async (releaseId: Release["id"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userTasks = await db.collection("tasks").where("release_id", "==", releaseId).get();

      const userTasksData = userTasks.docs.map((doc) => {
        const data = doc.data();
        return {
          taskId: doc.id,
          releaseId: data.release_id,
          projectId: data.project_id,
          taskName: data.task_name,
          taskDescription: data.task_description,
          priorityLevel: data.priority_level,
          taskType: data.task_type,
          subtasks: data.subtasks,
          taskStatus: data.task_status,
          taskAssigneeUid: data.task_assignee_uid,
          createdOn: data.created_on,
          lastUpdatedOn: data.last_updated_on,
        };
      });

      console.log("Success loading user tasks:", userTasksData);
      return userTasksData;
    }
  } catch (error) {
    console.error("Error loading user tasks!");
    throw error;
  }
};

const deleteTask = async (taskId: Task["id"]) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const task = await db.collection("tasks").doc(taskId).delete();
    console.log("Task deleted successfully.");
    return task;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

const addUserToProjectViaInviteCode = async (inviteCode: Project["invite_code"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const project = await db.collection("projects").where("invite_code", "==", inviteCode).limit(1).get();
      if (project.empty) {
        throw new Error("Invalid invite code");
      }
      const projectDoc = project.docs[0];
      await projectDoc.ref.update({
        [`members.${currentUser.uid}`]: {
          isManager: false,
        },
      });
    }
  } catch (error) {
    console.error("Error adding user to project via invite code!:", error);
    throw error;
  }
};

const updateProjectMemberManagerStatus = async (projectId: Project["id"], userId: User["id"], isManager: boolean) => {
  try {
    await db
      .collection("projects")
      .doc(projectId)
      .update({
        [`members.${userId}.isManager`]: isManager,
      });
  } catch (error) {
    console.error("Error updating manager status:", error);
    throw error;
  }
};

const createTask = async (
  release_id: Task["release_id"],
  project_id: Task["project_id"],
  task_name: Task["task_name"],
  task_description: Task["task_description"],
  priority_level: Task["priority_level"],
  task_type: Task["task_type"],
  task_assignee_uid: Task["task_assignee_uid"],
  subtasks: Task["subtasks"]
): Promise<{ success: boolean; taskId: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const assigned_user_uid: Task["assigned_user_uid"] = currentUser.uid;
      const taskRef = db.collection("tasks").doc();
      const taskId: Task["id"] = taskRef.id;
      const now: Timestamp = Timestamp.now();
      
      // Create a new Task object
      const newTask: Task = {
        task_assignee_uid,
        assigned_user_uid,
        created_on: now,
        last_updated_on: now,
        priority_level,
        project_id,
        release_id,
        subtasks,
        task_description,
        task_name,
        task_type,
        task_status: "in-progress"
      };

      await taskRef.set(newTask);
      return { success: true, taskId };
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

const editTask = async (
  task_id: Task["id"],
  task_name: Task["task_name"],
  task_description: Task["task_description"],
  task_status: Task["task_status"],
  task_type: Task["task_type"],
  priority_level: Task["priority_level"],
  task_assignee_uid: Task["task_assignee_uid"],
  subtasks: Task["subtasks"]
) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const now = Timestamp.now();
      await db.collection("tasks").doc(task_id).update({
        task_name,
        task_description,
        task_status,
        task_type,
        priority_level,
        task_assignee_uid,
        subtasks,
        last_updated_on: now,
      });
      console.log("Task updated successfully!");
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error updating task: ", error);
    throw error;
  }
};

const createRelease = async (project_id: Release["project_id"], name: Release["name"], description: Release["description"], planned_end_date: Release["planned_end_date"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const now = Timestamp.now();
      const releaseData: Release = {
        project_id,
        name,
        description,
        start_date: null,
        actual_end_date: null,
        created_on: now,
        last_updated_on: now,
        planned_end_date,
        status: "planned",
      };

      await db.collection("releases").add(releaseData);
    }
  } catch (error) {
    console.error("Error creating new release:", error);
    throw error;
  }
};

const getProjectReleases = async (projectId: Project["id"]) => {
  try {
    const releases = await db.collection("releases").where("project_id", "==", projectId).get();
    console.log(
      "releases:",
      releases.docs.map((doc) => doc.data())
    );
    const releasesData = releases.docs.map((doc) => {
      const data = doc.data();
      return {
        releaseId: doc.id,
        name: data.name,
        description: data.description,
        startDate: data.start_date,
        plannedEndDate: data.planned_end_date,
        actualEndDate: data.actual_end_date,
        status: data.status,
        createdOn: data.created_on,
        lastUpdatedOn: data.last_updated_on,
      };
    });
    console.log("Success loading project releases:", releasesData);
    return releasesData;
  } catch (error) {
    console.error("Error getting project releases:", error);
    throw error;
  }
};

const getAllReleases = async () => {
  try {
    const releases = await db.collection("releases").get();
    console.log(
      "releases:",
      releases.docs.map((doc) => doc.data())
    );
    const releasesData = releases.docs.map((doc) => {
      const data = doc.data();
      return {
        releaseId: doc.id,
        projectId: data.project_id,
        name: data.name,
        description: data.description,
        startDate: data.start_date,
        plannedEndDate: data.planned_end_date,
        actualEndDate: data.actual_end_date,
        status: data.status,
        createdOn: data.created_on,
        lastUpdatedOn: data.last_updated_on,
      };
    });
    console.log("Success loading all releases:", releasesData);
    return releasesData;
  } catch (error) {
    console.error("Error getting all releases:", error);
    throw error;
  }
};

const deleteRelease = async (releaseId: Release["id"]) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  try {
    await db.collection("releases").doc(releaseId).delete();
    console.log("Release deleted successfully.");
  } catch (error) {
    console.error("Error deleting release:", error);
    throw error;
  }
};

const deleteReleaseWithTasks = async (releaseId: Release["id"]) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const batch = db.batch();
    const releaseRef = db.collection("releases").doc(releaseId);
    const tasksSnapshot = await db.collection("tasks").where("release_id", "==", releaseId).get();

    // Add each task deletion to the batch
    tasksSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the release itself
    batch.delete(releaseRef);

    // Commit the batch (atomic operation)
    await batch.commit();
    console.log("Release and all tasks deleted successfully.");
    return;
  } catch (error) {
    console.error("Error deleting release:", error);
    throw error;
  }
};

const editRelease = async (
  releaseId: Release["id"], 
  name: Release["name"], 
  description: Release["description"], 
  plannedEndDate: Date, 
  status: Release["status"]
) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const last_updated_on = Timestamp.now();
      await db
        .collection("releases")
        .doc(releaseId)
        .update({
          name,
          description,
          planned_end_date: Timestamp.fromDate(plannedEndDate),
          status,
          last_updated_on,
        });
      console.log("Release updated successfully!");
      return;
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error updating release: ", error);
    throw error;
  }
};

// TODO: rename to "revertReleaseToPlanned"
const revertRelease = async (releaseId: Release["id"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const last_updated_on = Timestamp.now();
      await db.collection("releases").doc(releaseId).update({
        status: "planned",
        start_date: null,
        actual_end_date: null,
        last_updated_on,
      } satisfies { status: Release["status"], start_date: null, actual_end_date: null, last_updated_on: Timestamp });
      console.log("Release status reverted to planned successfully!");
      return;
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error reverting release status to planned: ", error);
    throw error;
  }
};

const startRelease = async (releaseId: Release["id"], projectId: Project["id"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Check for existing started releases in this project - only 1 can be 'started'!
      const startedReleasesQuery = await db.collection("releases").where("project_id", "==", projectId).where("status", "==", "started").get();
      if (!startedReleasesQuery.empty) {
        throw new Error("Cannot start release - another release is already in progress");
      }
      const last_updated_on = Timestamp.now();
      await db.collection("releases").doc(releaseId).update({
        status: "in-progress",
        start_date: Timestamp.now(),
        actual_end_date: null,
        last_updated_on,
      } satisfies { status: Release["status"], start_date: Timestamp, actual_end_date: null, last_updated_on: Timestamp });
      console.log("Release started successfully!");
      return;
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error starting release: ", error);
    throw error;
  }
};

const finishRelease = async (releaseId: Release["id"]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const last_updated_on = Timestamp.now();
      await db.collection("releases").doc(releaseId).update({
        status: "finished",
        actual_end_date: Timestamp.now(),
        last_updated_on,
      } satisfies { status: Release["status"], actual_end_date: Timestamp, last_updated_on: Timestamp });
      console.log("Release finished successfully!");
      return;
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error finishing release: ", error);
    throw error;
  }
};

const getUserNotifications = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userNotifications = await db.collection("notifications")
        .where("user_uids", "array-contains", currentUser.uid)
        .orderBy("created_on", "desc")
        .get();
      
      const userNotificationsData = userNotifications.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          body: data.body,
          created_on: data.created_on,
          user_uids: data.user_uids
        } satisfies Notification;
      });
      
      console.log("Success loading user notifications:", userNotificationsData);
      return userNotificationsData;
    }
  } catch (error) {
    console.error("Error loading user notifications!");
    throw error;
  }
};

export const fbFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
  signUpUser,
  createProject,
  editProject,
  removeUserFromProject,
  deleteProject,
  loadUserProjects,
  loadUserTasks,
  loadReleaseTasks,
  deleteTask,
  editTask,
  addUserToProjectViaInviteCode,
  refreshProjectInviteCode,
  updateProjectMemberManagerStatus,
  createTask,
  createRelease,
  getProjectReleases,
  deleteRelease,
  deleteReleaseWithTasks,
  editRelease,
  getAllReleases,
  startRelease,
  finishRelease,
  revertRelease,
  getUserNotifications
};
