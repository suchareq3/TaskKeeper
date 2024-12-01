import { getApp, getAuth, signInWithEmailAndPassword, signOut, getFirestore, createUserWithEmailAndPassword, getFunctions, httpsCallable } from "../TaskKeeper-mobile/exportedModules.js";
//import firebase from '@react-native-firebase/app';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import firebaseConfig from "./firebaseWebConfig";
import { platform } from "./shared";
import { FirebaseFunctions } from "./firebaseInterface";

const app = getApp(); // gets config from google-services.json
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

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

const checkUserStatus = () => {
  console.log("current user email: " + JSON.stringify(auth.currentUser));
};

const checkUserLoginStatus = (nextOrObserver) => {
  return auth.onAuthStateChanged(nextOrObserver);
};


const signUpUser = async (email: string, password: string, extraData: { [key: string]: string }) => {
  try {
    const registerUserFunction = functions.httpsCallable("signUpUser");
    const result = await registerUserFunction({ email, password, extraData });
    console.log("User registration successful!: ", result);
    logInWithPassword(email, password);
  } catch (error) {
    console.error("Error registering user:", error);
  }
};

export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
  signUpUser,
};
