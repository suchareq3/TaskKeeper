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
} from "../TaskKeeper-mobile/exportedModules.js";
import { platform } from "./shared";
import { FirebaseFunctions } from "./firebaseInterface";
import { start } from "repl";

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

const logInWithPassword = (email: string, password: string) => {
  if (email === "" || password === "") {
    throw "email or password is empty!";
  }
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("lougged the fuck in! logged in user:" + userCredential.user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("error during login!: " + error.code + ", " + error.message);
    });
};

const logOutUser = () => {
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

//TODO: this doesn't need to be a cloud function
//TODO: also, wrap this in a transaction or batched write
const signUpUser = async (email: string, password: string, extraData: { [key: string]: string }) => {
  try {
    //await messaging().registerDeviceForRemoteMessages();
    extraData["fcm_token"] = await messaging().getToken();
    //extraData["fcm_token"] = "cog3p2waTrSuK2V7RoAfkF:APA91bGbyBsdMfrgEFvupVLu3nkjRngfEZSghTh--L2_ZaK-eGuKSJlRCZLoAEFvupVLu3nkjRngfEZSghTh--dLPXa5NkEg8IdKPY5l7RylkO9c3qI5q5TghE5wUk34-pBc3qI5q5TghE5wUk34-pBmzguHmzguH1By-nzxM";
    const registerUserFunction = functions.httpsCallable("signUpUser");
    const result = await registerUserFunction({ email, password, extraData });
    console.log("User registration successful!: ", result);
    logInWithPassword(email, password);
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

//TODO: complete this function! right now it's a placeholder!
const showNotification = async (title: string, description: string) => {
  try {
    //await messaging().registerDeviceForRemoteMessages();

    //TODO: remake this so that it takes the token (or tokens) as an argument
    //const fcm_token = await messaging().getToken();
    await messaging().registerDeviceForRemoteMessages();
    const fcm_token =
      "cog3p2waTrSuK2V7RoAfkF:APA91bGbyBsdMfrgEFvupVLu3nkjRngfEZSghTh--L2_ZaK-eGuKSJlRCZLoAEFvupVLu3nkjRngfEZSghTh--dLPXa5NkEg8IdKPY5l7RylkO9c3qI5q5TghE5wUk34-pBc3qI5q5TghE5wUk34-pBmzguHmzguH1By-nzxM";
    console.log(await messaging().getToken());

    return await messaging().getToken();

    //return token;
    const pushNotificationFunction = functions.httpsCallable("pushNotification");
    const result = await pushNotificationFunction({ fcm_token, title, description });
  } catch (error) {
    console.error("Error showing notification:", error);
    throw error;
  }
};

// NOTE: this is a cloud function because it involves password generation, which is safer handled on the server
// TODO: consider writing a separate onTrigger daily/weekly/monthly function for regenerating invite codes. users with invite code permissions should be able to see the remaining time until the invite code expires
const createProject = async (name: string, description: string, githubUrl: string) => {
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

const refreshProjectInviteCode = async (projectId: string) => {
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

const editProject = async (projectId: string, name: string, description: string, githubUrl: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Timestamp.now();
      await db
        .collection("projects")
        .doc(projectId)
        .update({
          name: name,
          description: description,
          github_url: githubUrl,
          last_updated_on: lastUpdatedOn,
        })
        .then((res) => {
          console.log("editProject response: ", res);
          return { success: true, projectData: { name: name, description: description, githubUrl: githubUrl, lastUpdatedOn: lastUpdatedOn } };
        });
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("Error editing project:", error);
    throw error;
  }
};

const removeUserFromProject = async (projectId: string, userId: string) => {
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

const deleteProject = async (projectId: string) => {
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

const loadReleaseTasks = async (releaseId: string) => {
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

const deleteTask = async (taskId: string) => {
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

const addUserToProjectViaInviteCode = async (inviteCode: string) => {
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

const updateProjectMemberManagerStatus = async (projectId: string, userId: string, isManager: boolean) => {
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
  releaseId: string,
  projectId: string,
  taskName: string,
  taskDescription: string,
  priorityLevel: string,
  taskType: string,
  taskAssigneeUid: string,
  subTaskdata: { key: string; label: string; completed: boolean }[]
) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      let taskData = {
        release_id: releaseId,
        project_id: projectId,
        task_name: taskName,
        task_description: taskDescription,
        priority_level: priorityLevel,
        task_type: taskType,
        task_assignee_uid: taskAssigneeUid,
        subtasks: subTaskdata,

        task_status: "in-progress",
        created_on: Timestamp.now(),
        last_updated_on: Timestamp.now(),
        assigned_user_uid: currentUser.uid,
      };

      await db.collection("tasks").add(taskData);
    }
  } catch (error) {
    console.error("Error creating new task:", error);
    throw error;
  }
};

const editTask = async (
  taskId: string,
  name: string,
  description: string,
  status: string,
  type: string,
  priorityLevel: string,
  assigneeUid: string,
  subtasks: Array<{ key: string; label: string; completed: boolean }>
) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Timestamp.now();
      await db.collection("tasks").doc(taskId).update({
        task_name: name,
        task_description: description,
        task_status: status,
        task_type: type,
        priority_level: priorityLevel,
        task_assignee_uid: assigneeUid,
        subtasks: subtasks,
        last_updated_on: lastUpdatedOn,
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

const createRelease = async (projectId: string, releaseName: string, releaseDescription: string, plannedEndDate: Date) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const releaseData = {
        project_id: projectId,
        name: releaseName,
        description: releaseDescription,
        created_on: Timestamp.now(),
        last_updated_on: Timestamp.now(),
        planned_end_date: Timestamp.fromDate(plannedEndDate),
        status: "planned",
      };

      await db.collection("releases").add(releaseData);
    }
  } catch (error) {
    console.error("Error creating new release:", error);
    throw error;
  }
};

const getProjectReleases = async (projectId: string) => {
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

const deleteRelease = async (releaseId: string) => {
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

const deleteReleaseWithTasks = async (releaseId: string) => {
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

const editRelease = async (releaseId: string, name: string, description: string, plannedEndDate: Date, status: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Timestamp.now();
      await db
        .collection("releases")
        .doc(releaseId)
        .update({
          name: name,
          description: description,
          planned_end_date: Timestamp.fromDate(plannedEndDate),
          status: status,
          last_updated_on: lastUpdatedOn,
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

const revertRelease = async (releaseId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Timestamp.now();
      await db.collection("releases").doc(releaseId).update({
        status: "planned",
        start_date: null,
        actual_end_date: null,
        last_updated_on: lastUpdatedOn,
      });
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

const startRelease = async (releaseId: string, projectId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Check for existing started releases in this project - only 1 can be 'started'!
      const startedReleasesQuery = await db.collection("releases").where("project_id", "==", projectId).where("status", "==", "started").get();
      if (!startedReleasesQuery.empty) {
        throw new Error("Cannot start release - another release is already in progress");
      }
      const lastUpdatedOn = Timestamp.now();
      await db.collection("releases").doc(releaseId).update({
        status: "started",
        start_date: Timestamp.now(),
        actual_end_date: null,
        last_updated_on: lastUpdatedOn,
      });
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

const finishRelease = async (releaseId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Timestamp.now();
      await db.collection("releases").doc(releaseId).update({
        status: "finished",
        actual_end_date: Timestamp.now(),
        last_updated_on: lastUpdatedOn,
      });
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
      const userNotifications = await db.collection("notifications").where("user_uids", "array-contains", currentUser.uid).orderBy("created_on", "desc").get();
      const userNotificationsData = userNotifications.docs.map((doc) => {
        const data = doc.data();
        return {
          notificationId: doc.id,
          title: data.title,
          body: data.body,
          createdOn: data.created_on,
        };
      });
      console.log("Success loading user notifications:", userNotificationsData);
      return userNotificationsData;
    }
  } catch (error) {
    console.error("Error loading user notifications!");
    throw error;
  }
};

export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
  signUpUser,
  showNotification,
  createProject,
  editProject,
  removeUserFromProject,
  deleteProject,
  loadUserProjects,
  loadUserTasks,
  loadReleaseTasks,
  deleteTask,
  addUserToProjectViaInviteCode,
  refreshProjectInviteCode,
  updateProjectMemberManagerStatus,
  createTask,
  editTask,
  createRelease,
  getProjectReleases,
  deleteRelease,
  deleteReleaseWithTasks,
  editRelease,
  getAllReleases,
  startRelease,
  finishRelease,
  revertRelease,
  getUserNotifications,
};
