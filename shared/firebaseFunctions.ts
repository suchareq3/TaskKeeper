import {
  initializeApp,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  getFirestore,
  getFunctions,
  connectAuthEmulator,
  connectFirestoreEmulator,
  connectFunctionsEmulator,
  Timestamp,
  getMessaging,
  firestore,
  getToken,
  httpsCallable,
  collection,
  setDoc,
  updateDoc,
  doc,
  deleteField,
  writeBatch,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  limit,
  orderBy,
  getDoc,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  connectStorageEmulator,
} from "../taskkeeper-web2/exportedModules.js";
import firebaseConfig from "./firebaseWebConfig";
import { appStartInfo, platform } from "./shared";
import { FirebaseFunctions } from "./firebaseInterface";
import { v4 as uuidv4 } from "uuid";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore();
const functions = getFunctions(app);
const storage = getStorage(app);

// TODO: delet dis later
connectAuthEmulator(auth, "http://localhost:9099");
connectFirestoreEmulator(db, "localhost", 8080);
connectFunctionsEmulator(functions, "localhost", 5001);
connectStorageEmulator(storage, "localhost", 9199);

const someSharedFunction = () => {
  console.log(`Called from shared function! Project type: ${platform}`);
};

const logInWithPassword = async (email: string, password: string) => {
  if (email === "" || password === "") {
    throw new Error("Email or password is empty");
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully");
    return userCredential.user;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    // Map Firebase error codes to user-friendly messages
    let userFriendlyMessage = "Failed to sign in";
    
    if (errorCode === 'auth/invalid-email') {
      userFriendlyMessage = "Invalid email address format";
    } else if (errorCode === 'auth/user-disabled') {
      userFriendlyMessage = "This account has been disabled";
    } else if (errorCode === 'auth/user-not-found') {
      userFriendlyMessage = "No account found with this email";
    } else if (errorCode === 'auth/wrong-password') {
      userFriendlyMessage = "Incorrect password";
    } else if (errorCode === 'auth/too-many-requests') {
      userFriendlyMessage = "Too many failed login attempts. Please try again later";
    } else if (errorCode === 'auth/network-request-failed') {
      userFriendlyMessage = "Network error. Please check your connection";
    }
    
    console.error(`Login error: ${errorCode} - ${errorMessage}`);
    throw new Error(userFriendlyMessage);
  }
};

const logOutUser = async () => {
  try {
    await signOut(auth);
    console.log("Logout successful");
  } catch (error: any) {
    console.error("Error during logout:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
};

const checkUserStatus = async () => {
  console.log("current user email: " + JSON.stringify(auth.currentUser));
  const fcm_token = await getToken(getMessaging());
  console.log("current fcm_token: " + JSON.stringify(fcm_token));
  return JSON.stringify(auth.currentUser);
};

const checkUserLoginStatus = (nextOrObserver) => {
  return auth.onAuthStateChanged(nextOrObserver);
};

const signUpUser = async (email: string, password: string, extraData: { [key: string]: any }) => {
  let userCredential: any = null;
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    
    extraData["fcm_token"] = await getToken(getMessaging());

    // Step 1: Create user in Auth
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      // Map Firebase auth error codes to user-friendly messages
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error("An account with this email already exists");
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error("Invalid email address format");
      } else if (authError.code === 'auth/operation-not-allowed') {
        throw new Error("Email/password accounts are not enabled");
      } else if (authError.code === 'auth/weak-password') {
        throw new Error("Password is too weak");
      } else {
        throw new Error("Failed to create account: " + authError.message);
      }
    }
    
    const user_uid = userCredential.user.uid;

    // Step 2: Create user record in Firestore
    try {
      await setDoc(doc(db, "users", user_uid), {
        ...extraData,
        created_on: Timestamp.now(),
        last_updated_on: Timestamp.now(),
      });
    } catch (firestoreError) {
      // Rollback: If the Firestore write fails after creating the Auth user, delete the Auth user
      if (userCredential) {
        try {
          await userCredential.user.delete();
          console.log("Rolled back auth user creation due to Firestore error");
        } catch (deleteError) {
          console.error("Failed to rollback auth user:", deleteError);
        }
      }
      throw new Error("Failed to create user profile");
    }

    await logInWithPassword(email, password);
    return { success: true, uid: user_uid };
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    // If it's already an Error object with a message, just rethrow it
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise, create a new Error with a generic message
    throw new Error("Failed to create account");
  }
};

const signUpUserNoToken = async (email: string, password: string, extraData: { [key: string]: any }) => {
  let userCredential: any = null;
  try {
    if (!email || !password) {
      throw new Error("Missing email or password.");
    }

    extraData["fcm_token"] = "";

    // Step 1: Create user in Auth
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user_uid = userCredential.user.uid;

    // Step 2: Create user record in Firestore
    await setDoc(doc(db, "users", user_uid), {
      ...extraData,
      created_on: Timestamp.now(),
      last_updated_on: Timestamp.now(),
    });

    await logInWithPassword(email, password);
    return { success: true, uid: user_uid };
  } catch (error) {
    console.error("Error creating user:", error);
    // Rollback: If the Firestore write fails after creating the Auth user, delete the Auth user.
    if (userCredential) {
      try {
        await userCredential.user.delete();
        console.log("Rolled back auth user creation due to Firestore error.");
      } catch (deleteError) {
        console.error("Failed to rollback auth user:", deleteError);
      }
    }
    throw new Error("Error creating new user: " + error);
  }
};

// NOTE: this is a cloud function because it involves password generation, which is safer handled on the server
// TODO: consider writing a separate onTrigger daily/weekly/monthly function for regenerating invite codes. users with invite code permissions should be able to see the remaining time until the invite code expires
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
      const createProjectFunction = httpsCallable(functions, "createProject");
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
      const refreshInviteCodeFunction = httpsCallable(functions, "refreshProjectInviteCode");
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
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Timestamp.now();
      await updateDoc(doc(db, "projects", projectId), {
        name: name,
        description: description,
        github_url: githubUrl,
        last_updated_on: lastUpdatedOn,
      }).then((res) => {
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
      await updateDoc(doc(db, "projects", projectId), {
        [`members.${userId}`]: deleteField(), // Deletes the userId key
      }).then(() => {
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

    const batch = writeBatch(db);
    const projectRef = doc(db, "projects", projectId);
    const tasksQuery = query(collection(db, "tasks"), where("project_id", "==", projectId));
    const tasksSnapshot = await getDocs(tasksQuery);

    tasksSnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });

    batch.delete(projectRef);
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
    if (!uid) throw new Error("User not authenticated");

    const projectsQuery = query(collection(db, "projects"), where(`members.${uid}`, "!=", null));
    const userProjects = await getDocs(projectsQuery);

    return userProjects.docs.map((doc) => ({
      projectId: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      githubUrl: doc.data().github_url,
      members: doc.data().members,
      userPermissions: doc.data().members[uid],
      lastUpdatedOn: doc.data().last_updated_on,
      inviteCode: doc.data().invite_code,
    }));
  } catch (error) {
    console.error("Error loading user projects!:", error);
    throw error;
  }
};

const loadUserTasks = async () => {
  try {
    const userUid = auth.currentUser?.uid;
    if (!userUid) throw new Error("User not authenticated");

    const tasksQuery = query(collection(db, "tasks"), where("assigned_user_uid", "==", userUid));
    const userTasks = await getDocs(tasksQuery);

    return userTasks.docs.map((doc) => ({
      taskId: doc.id,
      releaseId: doc.data().release_id,
      projectId: doc.data().project_id,
      taskName: doc.data().task_name,
      taskDescription: doc.data().task_description,
      priorityLevel: doc.data().priority_level,
      taskType: doc.data().task_type,
      subtasks: doc.data().subtasks,
      taskStatus: doc.data().task_status,
      taskAssigneeUid: doc.data().task_assignee_uid,
      createdOn: doc.data().created_on,
      lastUpdatedOn: doc.data().last_updated_on,
    }));
  } catch (error) {
    console.error("Error loading user tasks!");
    throw error;
  }
};

const loadReleaseTasks = async (releaseId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const tasksQuery = query(collection(db, "tasks"), where("release_id", "==", releaseId));
      const userTasks = await getDocs(tasksQuery);

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

    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    console.log("Task deleted successfully.");
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

const addUserToProjectViaInviteCode = async (inviteCode: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const projectQuery = query(collection(db, "projects"), where("invite_code", "==", inviteCode), limit(1));
      const projectSnapshot = await getDocs(projectQuery);
      if (projectSnapshot.empty) {
        throw new Error("Invalid invite code");
      }
      const projectDoc = projectSnapshot.docs[0];
      await updateDoc(projectDoc.ref, {
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
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      [`members.${userId}.isManager`]: isManager,
    });
    console.log("Manager status updated successfully!");
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

      await addDoc(collection(db, "tasks"), taskData);
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
      await updateDoc(doc(db, "tasks", taskId), {
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

      await addDoc(collection(db, "releases"), releaseData);
    }
  } catch (error) {
    console.error("Error creating new release:", error);
    throw error;
  }
};

const getProjectReleases = async (projectId: string) => {
  try {
    const releasesQuery = query(collection(db, "releases"), where("project_id", "==", projectId));
    const releasesSnapshot = await getDocs(releasesQuery);
    console.log(
      "releases:",
      releasesSnapshot.docs.map((doc) => doc.data())
    );
    const releasesData = releasesSnapshot.docs.map((doc) => {
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
    const releasesQuery = query(collection(db, "releases"));
    const releasesSnapshot = await getDocs(releasesQuery);
    console.log(
      "releases:",
      releasesSnapshot.docs.map((doc) => doc.data())
    );
    const releasesData = releasesSnapshot.docs.map((doc) => {
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
    await deleteDoc(doc(db, "releases", releaseId));
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
    const batch = writeBatch(db);
    const releaseRef = doc(db, "releases", releaseId);
    const tasksSnapshot = await getDocs(query(collection(db, "tasks"), where("release_id", "==", releaseId)));

    // Add each task deletion to the batch
    tasksSnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
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
      await updateDoc(doc(db, "releases", releaseId), {
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
      await updateDoc(doc(db, "releases", releaseId), {
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
      const startedReleasesQuery = query(collection(db, "releases"), where("project_id", "==", projectId), where("status", "==", "started"));
      const startedReleasesSnapshot = await getDocs(startedReleasesQuery);
      if (!startedReleasesSnapshot.empty) {
        throw new Error("Cannot start release - another release is already in progress");
      }
      const lastUpdatedOn = Timestamp.now();
      await updateDoc(doc(db, "releases", releaseId), {
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
      await updateDoc(doc(db, "releases", releaseId), {
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
      const userNotificationsQuery = query(collection(db, "notifications"), where("user_uids", "array-contains", currentUser.uid), orderBy("created_on", "desc"));
      const userNotificationsSnapshot = await getDocs(userNotificationsQuery);
      const userNotificationsData = userNotificationsSnapshot.docs.map((doc) => {
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

const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, "users"));
    const usersSnapshot = await getDocs(usersQuery);
    const usersData = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        first_name: data.first_name,
        last_name: data.last_name,
        fcm_token: data.fcm_token,
        date_of_birth: data.date_of_birth,
        created_on: data.created_on,
        last_updated_on: data.last_updated_on,
        email: data.email,
      };
    });
    console.log("Success loading all users:", usersData);
    return usersData;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

const getUserById = async (userId: string) => {
  try {
    console.log("getUserById userId:", userId);
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    console.log("userDoc:", userDoc.data());
    const userData = userDoc.data();
    return {
      id: userDoc.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      fcm_token: userData.fcm_token,
      date_of_birth: userData.date_of_birth,
      created_on: userData.created_on,
      last_updated_on: userData.last_updated_on,
    };
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

const updateUserDetails = async (userId: string, data: { [key: string]: any }) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      ...data,
      last_updated_on: Timestamp.now(),
    });
    console.log("User details updated successfully!");
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};

const deleteUserById = async (userId: string) => {
  try {
    // Get the currently signed-in user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to delete a user.");
    }

    // Delete Firestore record
    const deleteUserFn = httpsCallable(functions, "deleteUserById");
    const result = await deleteUserFn({ userId });
    console.log(result);

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

const getAllProjects = async () => {
  try {
    const projectsQuery = query(collection(db, "projects"));
    const projectsSnapshot = await getDocs(projectsQuery);
    const projectsData = projectsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        github_url: data.github_url,
        members: data.members,
        created_on: data.created_on,
        last_updated_on: data.last_updated_on,
        invite_code: data.invite_code,
      };
    });
    console.log("Success loading all projects:", projectsData);
    return projectsData;
  } catch (error) {
    console.error("Error getting all projects:", error);
    throw error;
  }
};

const getProjectById = async (projectId: string) => {
  try {
    const projectDoc = await getDoc(doc(db, "projects", projectId));
    const projectData = projectDoc.data();
    return {
      id: projectDoc.id,
      name: projectData.name,
      description: projectData.description,
      github_url: projectData.github_url,
      members: projectData.members,
      created_on: projectData.created_on,
      last_updated_on: projectData.last_updated_on,
      invite_code: projectData.invite_code,
    };
  } catch (error) {
    console.error("Error getting project by ID:", error);
    throw error;
  }
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
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const updatedData: Record<string, any> = { ...updatedFields };
    updatedData.last_updated_on = Timestamp.now();

    // Update Firestore document
    await updateDoc(doc(db, "projects", projectId), updatedData);

    console.log("Project updated:", updatedData);
    return { success: true, updatedData };
  } catch (error) {
    console.error("Error editing project:", error);
    throw error;
  }
};

const getReleaseById = async (releaseId: string) => {
  try {
    const releaseDoc = await getDoc(doc(db, "releases", releaseId));
    const releaseData = releaseDoc.data();
    console.log("releaseData:", releaseData);
    return {
      id: releaseDoc.id,
      project_id: releaseData.project_id,
      name: releaseData.name,
      description: releaseData.description,
      start_date: releaseData.start_date,
      planned_end_date: releaseData.planned_end_date,
      actual_end_date: releaseData.actual_end_date,
      status: releaseData.status,
      created_on: releaseData.created_on,
      last_updated_on: releaseData.last_updated_on,
    };
  } catch (error) {
    console.error("Error getting release by ID:", error);
    throw error;
  }
};

const getAllTasks = async () => {
  try {
    const tasksQuery = query(collection(db, "tasks"));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasksData = tasksSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        release_id: data.release_id,
        project_id: data.project_id,
        task_name: data.task_name,
        task_description: data.task_description,
        priority_level: data.priority_level,
        task_type: data.task_type,
        subtasks: data.subtasks,
        task_status: data.task_status,
        task_assignee_uid: data.task_assignee_uid,
        created_on: data.created_on,
        last_updated_on: data.last_updated_on,
      };
    });
    console.log("Success loading all tasks:", tasksData);
    return tasksData;
  } catch (error) {
    console.error("Error getting all tasks:", error);
    throw error;
  }
};

const getTaskById = async (taskId: string) => {
  try {
    const taskDoc = await getDoc(doc(db, "tasks", taskId));
    const taskData = taskDoc.data();
    return {
      id: taskDoc.id,
      release_id: taskData.release_id,
      project_id: taskData.project_id,
      task_name: taskData.task_name,
      task_description: taskData.task_description,
      priority_level: taskData.priority_level,
      task_type: taskData.task_type,
      subtasks: taskData.subtasks,
      task_status: taskData.task_status,
      task_assignee_uid: taskData.task_assignee_uid,
      created_on: taskData.created_on,
      last_updated_on: taskData.last_updated_on,
    };
  } catch (error) {
    console.error("Error getting task by ID:", error);
    throw error;
  }
};

const getAllNotifications = async () => {
  try {
    const notificationsQuery = query(collection(db, "notifications"));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    const notificationsData = notificationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        body: data.body,
        created_on: data.created_on,
        user_uids: data.user_uids,
      };
    });
    console.log("Success loading all notifications:", notificationsData);
    return notificationsData;
  } catch (error) {
    console.error("Error getting all notifications:", error);
    throw error;
  }
};

const createCustomNotification = async (title: string, body: string, userUids: string[]) => {
  try {
    const notificationData = {
      title: title,
      body: body,
      created_on: Timestamp.now(),
      user_uids: userUids,
    };

    await addDoc(collection(db, "notifications"), notificationData);
    console.log("Custom notification created successfully!");
  } catch (error) {
    console.error("Error creating custom notification:", error);
    throw error;
  }
};

const getNotificationById = async (notificationId: string) => {
  try {
    const notificationDoc = await getDoc(doc(db, "notifications", notificationId));
    const notificationData = notificationDoc.data();
    return {
      id: notificationDoc.id,
      title: notificationData.title,
      body: notificationData.body,
      created_on: notificationData.created_on,
      user_uids: notificationData.user_uids,
    };
  } catch (error) {
    console.error("Error getting notification by ID:", error);
    throw error;
  }
};

const deleteNotificationById = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
    console.log("Notification deleted successfully.");
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

const getAllTemplates = async () => {
  try {
    const templatesQuery = query(collection(db, "templates"));
    const templatesSnapshot = await getDocs(templatesQuery);

    return templatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_on: doc.data().created_on?.toDate(),
    }));
  } catch (error) {
    console.error("Error getting templates:", error);
    throw error;
  }
};

const getTables = async () => {
  return ["notifications", "users", "releases", "tasks", "projects"];
};

const getTableFields = async (table: string) => {
  type FieldSchema = { name: string; type: string };
  type TableSchemas = {
    notifications: FieldSchema[];
    projects: FieldSchema[];
    releases: FieldSchema[];
    tasks: FieldSchema[];
    users: FieldSchema[];
  };
  const fieldSchemas: TableSchemas = {
    notifications: [
      { name: "title", type: "string" },
      { name: "body", type: "string" },
      { name: "created_on", type: "timestamp" },
      { name: "user_uids", type: "array" },
    ],
    users: [
      { name: "first_name", type: "string" },
      { name: "last_name", type: "string" },
      { name: "fcm_token", type: "string" },
      { name: "created_on", type: "timestamp" },
      { name: "last_updated_on", type: "timestamp" },
      { name: "date_of_birth", type: "timestamp" },
    ],
    releases: [
      { name: "created_on", type: "timestamp" },
      { name: "last_updated_on", type: "timestamp" },
      { name: "name", type: "string" },
      { name: "status", type: "string" },
      { name: "actual_end_date", type: "timestamp" },
      { name: "planned_end_date", type: "timestamp" },
      { name: "project_id", type: "string" },
      { name: "start_date", type: "timestamp" },
      { name: "description", type: "string" },
    ],
    tasks: [
      { name: "task_name", type: "string" },
      { name: "task_description", type: "string" },
      { name: "priority_level", type: "string" },
      { name: "task_type", type: "string" },
      { name: "subtasks", type: "array" },
      { name: "task_status", type: "string" },
      { name: "created_on", type: "timestamp" },
      { name: "last_updated_on", type: "timestamp" },
      { name: "assigned_user_uid", type: "string" },
      { name: "project_id", type: "string" },
      { name: "release_id", type: "string" },
    ],
    projects: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "github_url", type: "string" },
      { name: "members", type: "map" },
      { name: "created_on", type: "timestamp" },
      { name: "last_updated_on", type: "timestamp" },
      { name: "invite_code", type: "string" },
    ],
  };

  if (!(table in fieldSchemas)) {
    throw new Error("Invalid table specified");
  }

  // Use type assertion since we've already validated the table exists
  return fieldSchemas[table as keyof TableSchemas];
};

const uploadTemplate = async (name: string, table: string, fields: string[], file: File) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    // Generate unique ID
    const templateId = uuidv4(); // Add this line
    const storagePath = `templates/${templateId}.docx`;
    const storageRef = ref(storage, storagePath);

    // Upload file to storage
    await uploadBytes(storageRef, file);

    // Create template document
    const templateData = {
      name,
      table,
      fields,
      storagePath,
      created_by: currentUser.uid,
      created_on: Timestamp.now(),
    };

    await setDoc(doc(db, "templates", templateId), templateData);
    return templateId; // Return the generated ID
  } catch (error) {
    console.error("Error uploading template:", error);
    throw error;
  }
};

const handleDelete = async (templateId: string) => {
  try {
    const templateDoc = await getDoc(doc(db, "templates", templateId));
    if (!templateDoc.exists()) {
      throw new Error("Template not found");
    }

    const templateData = templateDoc.data();

    // Delete from storage
    const storageRef = ref(storage, templateData.storagePath);
    await deleteObject(storageRef);

    // Delete from firestore
    await deleteDoc(doc(db, "templates", templateId));
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};

const handleDownload = async (filePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, filePath);

    const url = await getDownloadURL(storageRef);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filePath.split("/").pop() || "download");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error("Failed to initiate download");
  }
};

const getDownloadUrlForPath = async (filePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error("Failed to get download URL");
  }
};

const getAllTableRecords = async (table: string) => {
  const snapshot = await getDocs(collection(db, table));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
  signUpUser,
  signUpUserNoToken,
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
  getAllUsers,
  getUserById,
  updateUserDetails,
  deleteUserById,
  getAllProjects,
  getProjectById,
  editProjectWithMembers,
  getReleaseById,
  getAllTasks,
  getTaskById,
  getAllNotifications,
  createCustomNotification,
  getNotificationById,
  deleteNotificationById,
  getAllTemplates,
  getTables,
  getTableFields,
  uploadTemplate,
  handleDelete,
  handleDownload,
  getDownloadUrlForPath,
  getAllTableRecords,
};
