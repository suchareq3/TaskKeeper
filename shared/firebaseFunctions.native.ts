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
  const fcmToken = await messaging().getToken();
  console.log("current fcmToken: " + JSON.stringify(fcmToken));
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
    extraData["fcmToken"] = await messaging().getToken();
    //extraData["fcmToken"] = "cog3p2waTrSuK2V7RoAfkF:APA91bGbyBsdMfrgEFvupVLu3nkjRngfEZSghTh--L2_ZaK-eGuKSJlRCZLoAEFvupVLu3nkjRngfEZSghTh--dLPXa5NkEg8IdKPY5l7RylkO9c3qI5q5TghE5wUk34-pBc3qI5q5TghE5wUk34-pBmzguHmzguH1By-nzxM";
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
    //const fcmToken = await messaging().getToken();
    await messaging().registerDeviceForRemoteMessages();
    const fcmToken =
      "cog3p2waTrSuK2V7RoAfkF:APA91bGbyBsdMfrgEFvupVLu3nkjRngfEZSghTh--L2_ZaK-eGuKSJlRCZLoAEFvupVLu3nkjRngfEZSghTh--dLPXa5NkEg8IdKPY5l7RylkO9c3qI5q5TghE5wUk34-pBc3qI5q5TghE5wUk34-pBmzguHmzguH1By-nzxM";
    console.log(await messaging().getToken());

    return await messaging().getToken();

    //return token;
    const pushNotificationFunction = functions.httpsCallable("pushNotification");
    const result = await pushNotificationFunction({ fcmToken, title, description });
  } catch (error) {
    console.error("Error showing notification:", error);
    throw error;
  }
};

//TODO: this doesn't need to be a cloud function
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

const editProject = async (projectId: string, name: string, description: string, githubUrl: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const lastUpdatedOn = Date.now();
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

const loadUserProjects = async () => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error("User not authenticated");
    }
    const getUserProjectsFunction = functions.httpsCallable("getUserProjects");
    const result = await getUserProjectsFunction({ uid });
    console.log("success loading user projects!:", result);
    return result.data;
  } catch (error) {
    console.error("Error loading user projects!:", error);
    throw error;
  }
};

const addUserToProjectViaInviteCode = async (inviteCode: string) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const project = await db.collection("projects").where("invite_code", "==", inviteCode).limit(1).get();
      const projectDoc = project.docs[0];
      await projectDoc.ref
        .update({
          member_uids: arrayUnion(currentUser.uid),
        })
        .then(() => {
          console.log("success adding user to project via invite code!");
        });
    }
  } catch (error) {
    console.error("Error adding user to project via invite code!:", error);
    throw error;
  }
};

type Item = {
  key: string;
  label: string;
  completed: boolean;
};

const createTask = async (projectId: string, taskName: string, taskDescription: string, priorityLevel: string, taskType: string, subTaskdata: { key: string; label: string; completed: boolean }[]) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      let taskData = {
        project_id: projectId,
        task_name: taskName,
        task_description: taskDescription,
        priority_level: priorityLevel,
        task_type: taskType,
        subtasks: subTaskdata,

        task_state: "in-progress",
        created_on: Date.now(),
        last_updated_on: Date.now(),
        assigned_user_uid: currentUser.uid,
      };

      await db.collection("tasks").add(taskData);
    }
  } catch (error) {
    console.error("Error creating new task:", error);
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
  loadUserProjects,
  addUserToProjectViaInviteCode,
  createTask,
};
