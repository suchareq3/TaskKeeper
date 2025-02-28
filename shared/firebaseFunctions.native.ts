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
  getStorage,
} from "../TaskKeeper-mobile/exportedModules.js";
import { platform } from "./shared";
import { FirebaseFunctions } from "./firebaseInterface";

const app = getApp(); // gets config from google-services.json
const auth = getAuth();
const db = getFirestore(app);
app.firestore().settings({
  persistence: true,
});
const functions = getFunctions();
const storage = getStorage();

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
    throw new Error("Email or password is empty");
  }
  
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User logged in successfully");
      return userCredential.user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      
      // Map Firebase error codes to translation keys
      let errorKey = "firebase_error_generic";
      
      if (errorCode === 'auth/invalid-email') {
        errorKey = "firebase_error_invalid_email";
      } else if (errorCode === 'auth/user-disabled') {
        errorKey = "firebase_error_user_disabled";
      } else if (errorCode === 'auth/user-not-found') {
        errorKey = "firebase_error_user_not_found";
      } else if (errorCode === 'auth/wrong-password') {
        errorKey = "firebase_error_wrong_password";
      } else if (errorCode === 'auth/too-many-requests') {
        errorKey = "firebase_error_too_many_requests";
      } else if (errorCode === 'auth/network-request-failed') {
        errorKey = "firebase_error_network_request_failed";
      }
      
      console.error(`Login error: ${errorCode} - ${errorMessage}`);
      
      // Create an error object with the translation key
      const translatedError = new Error(errorKey);
      // Add the original error code as a property for debugging
      (translatedError as any).code = errorCode;
      // Add a flag to indicate this is a translation key, not a direct message
      (translatedError as any).isTranslationKey = true;
      
      throw translatedError;
    });
};

const logOutUser = () => {
  return signOut(auth)
    .then(() => {
      console.log("Logout successful");
    })
    .catch((error) => {
      console.error("Error during logout:", error);
      throw new Error("firebase_error_generic");
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


const signUpUser = async (email: string, password: string, extraData: { [key: string]: any }) => {
  let user: FirebaseAuthTypes.UserCredential | null = null;
  try {
    if (!email || !password) {
      throw new Error("Email or password is empty");
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

    return { success: true, uid: user_uid };
  } catch (error: any) {
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
    
    // Map Firebase error codes to translation keys
    let errorKey = "firebase_error_generic";
    const errorCode = error.code;
    
    if (errorCode === 'auth/email-already-in-use') {
      errorKey = "firebase_error_email_already_in_use";
    } else if (errorCode === 'auth/invalid-email') {
      errorKey = "firebase_error_invalid_email";
    } else if (errorCode === 'auth/operation-not-allowed') {
      errorKey = "firebase_error_operation_not_allowed";
    } else if (errorCode === 'auth/weak-password') {
      errorKey = "firebase_error_weak_password";
    }
    
    // Create an error object with the translation key
    const translatedError = new Error(errorKey);
    // Add the original error code as a property for debugging
    (translatedError as any).code = errorCode;
    // Add a flag to indicate this is a translation key, not a direct message
    (translatedError as any).isTranslationKey = true;
    
    throw translatedError;
  }
};

const createProject = async (name: string, description: string, githubUrl: string) => {
  try {
    // Validate input parameters
    if (!name || name.trim() === '') {
      const errorKey = "project_error_name_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    const currentUser = auth.currentUser;
    console.log("currentUser:", currentUser);
    if (currentUser) {
      const uid = currentUser.uid;
      const createProjectFunction = functions.httpsCallable("createProject");
      const result = await createProjectFunction({ name, description, githubUrl, uid });
      console.log(result);
      return result;
    } else {
      const errorKey = "project_error_user_not_authenticated";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
  } catch (error: any) {
    console.error("Error creating new project:", error);
    
    // If it's already a translated error, just rethrow it
    if (error && (error as any).isTranslationKey) {
      throw error;
    }
    
    // Handle specific Firebase errors
    const errorCode = error?.code || '';
    let errorKey = "project_error_unknown";
    
    if (errorCode.includes('permission-denied')) {
      errorKey = "project_error_permission_denied";
    } else if (errorCode.includes('not-found')) {
      errorKey = "project_error_not_found";
    } else if (errorCode.includes('already-exists')) {
      errorKey = "project_error_already_exists";
    } else if (errorCode.includes('unauthenticated')) {
      errorKey = "project_error_user_not_authenticated";
    } else if (errorCode.includes('invalid-argument')) {
      errorKey = "project_error_invalid_argument";
    }
    
    // Create an error object with the translation key
    const translatedError = new Error(errorKey);
    // Add the original error code as a property for debugging
    (translatedError as any).code = errorCode;
    // Add a flag to indicate this is a translation key, not a direct message
    (translatedError as any).isTranslationKey = true;
    
    throw translatedError;
  }
};

const refreshProjectInviteCode = async (projectId: string) => {
  try {
    if (!projectId || projectId.trim() === '') {
      const errorKey = "project_error_id_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    const currentUser = auth.currentUser;
    console.log("currentUser:", currentUser);
    if (currentUser) {
      const uid = currentUser.uid;
      const refreshInviteCodeFunction = functions.httpsCallable("refreshProjectInviteCode");
      const result = await refreshInviteCodeFunction({ projectId });
      console.log(result);
      return result;
    } else {
      const errorKey = "project_error_user_not_authenticated";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
  } catch (error: any) {
    console.error("Error refreshing project invite code:", error);
    
    // If it's already a translated error, just rethrow it
    if (error && (error as any).isTranslationKey) {
      throw error;
    }
    
    // Handle specific Firebase errors
    const errorCode = error?.code || '';
    let errorKey = "project_error_unknown";
    
    if (errorCode.includes('permission-denied')) {
      errorKey = "project_error_permission_denied";
    } else if (errorCode.includes('not-found')) {
      errorKey = "project_error_not_found";
    } else if (errorCode.includes('unauthenticated')) {
      errorKey = "project_error_user_not_authenticated";
    }
    
    // Create an error object with the translation key
    const translatedError = new Error(errorKey);
    // Add the original error code as a property for debugging
    (translatedError as any).code = errorCode;
    // Add a flag to indicate this is a translation key, not a direct message
    (translatedError as any).isTranslationKey = true;
    
    throw translatedError;
  }
};

const editProject = async (projectId: string, name: string, description: string, githubUrl: string) => {
  try {
    // Validate input parameters
    if (!projectId || projectId.trim() === '') {
      const errorKey = "project_error_id_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    if (!name || name.trim() === '') {
      const errorKey = "project_error_name_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
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
      const errorKey = "project_error_user_not_authenticated";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
  } catch (error: any) {
    console.error("Error editing project:", error);
    
    // If it's already a translated error, just rethrow it
    if (error && (error as any).isTranslationKey) {
      throw error;
    }
    
    // Handle specific Firebase errors
    const errorCode = error?.code || '';
    let errorKey = "project_error_unknown";
    
    if (errorCode.includes('permission-denied')) {
      errorKey = "project_error_permission_denied";
    } else if (errorCode.includes('not-found')) {
      errorKey = "project_error_not_found";
    } else if (errorCode.includes('unauthenticated')) {
      errorKey = "project_error_user_not_authenticated";
    } else if (errorCode.includes('invalid-argument')) {
      errorKey = "project_error_invalid_argument";
    }
    
    // Create an error object with the translation key
    const translatedError = new Error(errorKey);
    // Add the original error code as a property for debugging
    (translatedError as any).code = errorCode;
    // Add a flag to indicate this is a translation key, not a direct message
    (translatedError as any).isTranslationKey = true;
    
    throw translatedError;
  }
};

const removeUserFromProject = async (projectId: string, userId: string) => {
  try {
    // Validate input parameters
    if (!projectId || projectId.trim() === '') {
      const errorKey = "project_error_id_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    if (!userId || userId.trim() === '') {
      const errorKey = "project_error_user_id_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
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
          return { success: true };
        });
    } else {
      const errorKey = "project_error_user_not_authenticated";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
  } catch (error: any) {
    console.error("Error removing user from project!:", error);
    
    // If it's already a translated error, just rethrow it
    if (error && (error as any).isTranslationKey) {
      throw error;
    }
    
    // Handle specific Firebase errors
    const errorCode = error?.code || '';
    let errorKey = "project_error_unknown";
    
    if (errorCode.includes('permission-denied')) {
      errorKey = "project_error_permission_denied";
    } else if (errorCode.includes('not-found')) {
      errorKey = "project_error_not_found";
    } else if (errorCode.includes('unauthenticated')) {
      errorKey = "project_error_user_not_authenticated";
    }
    
    // Create an error object with the translation key
    const translatedError = new Error(errorKey);
    // Add the original error code as a property for debugging
    (translatedError as any).code = errorCode;
    // Add a flag to indicate this is a translation key, not a direct message
    (translatedError as any).isTranslationKey = true;
    
    throw translatedError;
  }
};

const deleteProject = async (projectId: string) => {
  try {
    // Validate input parameters
    if (!projectId || projectId.trim() === '') {
      const errorKey = "project_error_id_required";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    // NOTE: batch deletes are limited to 500 writes, so only 499 tasks.
    const currentUser = auth.currentUser;
    if (!currentUser) {
      const errorKey = "project_error_user_not_authenticated";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    // Verify user is a manager of the project
    const projectDoc = await db.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
      const errorKey = "project_error_not_found";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    const projectData = projectDoc.data();
    if (!projectData?.members?.[currentUser.uid]?.isManager) {
      const errorKey = "project_error_not_manager";
      const translatedError = new Error(errorKey);
      (translatedError as any).isTranslationKey = true;
      throw translatedError;
    }
    
    // Get all releases for this project
    const releasesSnapshot = await db.collection("releases").where("project_id", "==", projectId).get();
    
    // Get all tasks for each release
    const batch = db.batch();
    let operationCount = 0;
    
    // Delete all tasks for each release
    for (const releaseDoc of releasesSnapshot.docs) {
      const tasksSnapshot = await db.collection("tasks").where("release_id", "==", releaseDoc.id).get();
      
      for (const taskDoc of tasksSnapshot.docs) {
        batch.delete(taskDoc.ref);
        operationCount++;
        
        if (operationCount >= 499) {
          // If we're approaching the batch limit, commit the current batch and create a new one
          await batch.commit();
          console.log(`Committed batch with ${operationCount} operations`);
          operationCount = 0;
          // Create a new batch
          const newBatch = db.batch();
        }
      }
      
      // Delete the release
      batch.delete(releaseDoc.ref);
      operationCount++;
    }
    
    // Delete the project
    batch.delete(db.collection("projects").doc(projectId));
    operationCount++;
    
    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(`Committed final batch with ${operationCount} operations`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting project:", error);
    
    // If it's already a translated error, just rethrow it
    if (error && (error as any).isTranslationKey) {
      throw error;
    }
    
    // Handle specific Firebase errors
    const errorCode = error?.code || '';
    let errorKey = "project_error_unknown";
    
    if (errorCode.includes('permission-denied')) {
      errorKey = "project_error_permission_denied";
    } else if (errorCode.includes('not-found')) {
      errorKey = "project_error_not_found";
    } else if (errorCode.includes('unauthenticated')) {
      errorKey = "project_error_user_not_authenticated";
    }
    
    // Create an error object with the translation key
    const translatedError = new Error(errorKey);
    // Add the original error code as a property for debugging
    (translatedError as any).code = errorCode;
    // Add a flag to indicate this is a translation key, not a direct message
    (translatedError as any).isTranslationKey = true;
    
    throw translatedError;
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
    // Validate that task name is not empty
    if (!taskName || taskName.trim() === '') {
      const error = new Error("task_error_name_required");
      (error as any).isTranslationKey = true;
      throw error;
    }
    
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
    // Validate that release name is not empty
    if (!releaseName || releaseName.trim() === '') {
      const error = new Error("release_error_name_required");
      (error as any).isTranslationKey = true;
      throw error;
    }

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

const signUpUserNoToken = async (email: string, password: string, extraData: { [key: string]: any }) => {
  try {
    if (!email || !password) {
      throw new Error("Missing email or password.");
    }

    extraData["fcm_token"] = "";

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user_uid = userCredential.user.uid;

    await db
      .collection("users")
      .doc(user_uid)
      .set({
        ...extraData,
        created_on: Timestamp.now(),
        last_updated_on: Timestamp.now(),
      });

    return { success: true, uid: user_uid };
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getUserById = async (userId: string) => {
  const snapshot = await db.collection("users").doc(userId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
};

const updateUserDetails = async (userId: string, data: { [key: string]: any }) => {
  await db.collection("users").doc(userId).update(data);
};

const deleteUserById = async (userId: string) => {
  await db.collection("users").doc(userId).delete();
};

const getAllProjects = async () => {
  const snapshot = await db.collection("projects").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getProjectById = async (projectId: string) => {
  const snapshot = await db.collection("projects").doc(projectId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
};

const editProjectWithMembers = async (
  projectId: string,
  updatedFields: Partial<{
    name: string;
    description: string;
    github_url: string;
    members: Record<string, { isManager: boolean }>;
  }>
) => {
  await db.collection("projects").doc(projectId).update(updatedFields);
};

const getReleaseById = async (releaseId: string) => {
  const snapshot = await db.collection("releases").doc(releaseId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
};

const getAllNotifications = async () => {
  const snapshot = await db.collection("notifications").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const createCustomNotification = async (title: string, body: string, userUids: string[]) => {
  await db.collection("notifications").add({
    title,
    body,
    userUids,
    created_on: Timestamp.now(),
  });
};

const getNotificationById = async (notificationId: string) => {
  const snapshot = await db.collection("notifications").doc(notificationId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
};

const deleteNotificationById = async (notificationId: string) => {
  await db.collection("notifications").doc(notificationId).delete();
};

const getAllTemplates = async () => {
  const snapshot = await db.collection("templates").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getTables = async () => {
  return ["users", "projects", "tasks", "releases", "notifications", "templates"];
};

const getTableFields = async (table: string) => {
  const snapshot = await db.collection("tableFields").doc(table).get();
  return snapshot.exists ? snapshot.data() : null;
};

const uploadTemplate = async (name: string, table: string, fields: string[], file: File) => {
  await db.collection("templates").add({
    name,
    table,
    fields,
    filePath: file.name,
    created_on: Timestamp.now(),
  });
};

const handleDelete = async (templateId: string) => {
  await db.collection("templates").doc(templateId).delete();
};

const handleDownload = async (filePath: string): Promise<void> => {
  const url = await storage.ref(filePath).getDownloadURL();
  window.open(url, "_blank");
};

const getDownloadUrlForPath = async (filePath: string): Promise<string> => {
  return await storage.ref(filePath).getDownloadURL();
};

const getAllTableRecords = async (table: string) => {
  const snapshot = await db.collection(table).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getAllTasks = async () => {
  const snapshot = await db.collection("tasks").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getTaskById = async (taskId: string) => {
  const snapshot = await db.collection("tasks").doc(taskId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
};


export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
  signUpUser,
  signUpUserNoToken, // Dodano
  getAllUsers, // Dodano
  getUserById, // Dodano
  updateUserDetails, // Dodano
  deleteUserById, // Dodano
  createProject,
  getAllProjects, // Dodano
  getProjectById, // Dodano
  editProjectWithMembers, // Dodano
  editProject,
  removeUserFromProject,
  deleteProject,
  loadUserProjects,
  loadUserTasks,
  loadReleaseTasks,
  deleteTask,
  addUserToProjectViaInviteCode,
  updateProjectMemberManagerStatus,
  createTask,
  editTask,
  createRelease,
  getProjectReleases,
  getAllReleases,
  getReleaseById, // Dodano
  deleteRelease,
  deleteReleaseWithTasks,
  editRelease,
  startRelease,
  finishRelease,
  revertRelease,
  getUserNotifications,
  getAllNotifications, // Dodano
  createCustomNotification, // Dodano
  getNotificationById, // Dodano
  deleteNotificationById, // Dodano
  getAllTemplates, // Dodano
  getTables, // Dodano
  getTableFields, // Dodano
  uploadTemplate, // Dodano
  handleDelete, // Dodano
  handleDownload, // Dodano
  getDownloadUrlForPath, // Dodano
  getAllTableRecords, // Dodano
  refreshProjectInviteCode,
  getAllTasks,
  getTaskById,
};
