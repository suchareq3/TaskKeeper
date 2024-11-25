import {
  getApp,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "../TaskKeeper-mobile/exportedModules.js";
//import firebase from '@react-native-firebase/app';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import firebaseConfig from "./firebaseWebConfig";
import { platform } from "./shared";
import { FirebaseFunctions } from "./firebaseInterface";

const app = getApp(); // gets config from google-services.json
const auth = getAuth(app);

const someSharedFunction = () => {
  console.log(`Called from shared function! Project type: ${platform}`);
};

const logInWithPassword = (email: string, password: string) => {
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
      console.log(
        "something went uh-oh during logging out! oopsie woopsie! >w< " + error
      );
    });
};

const checkUserStatus = () => {
  console.log("current user email: " + JSON.stringify(auth.currentUser));
};

const checkUserLoginStatus = (nextOrObserver) => {
  return auth.onAuthStateChanged(nextOrObserver);
};

export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
};
