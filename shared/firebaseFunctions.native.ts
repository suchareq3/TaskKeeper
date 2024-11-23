import { getApp, getAuth, signInWithEmailAndPassword, signOut } from '../TaskKeeper-mobile/exportedModules.js'
//import firebase from '@react-native-firebase/app';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from "./firebaseWebConfig";
import { platform } from './shared';
import { FirebaseFunctions } from './firebaseInterface';

// TODO: is this network-safe? will this work even with network lag?
const app = getApp(); // gets config from google-services.json
const auth = getAuth(app)

const someSharedFunction = () => {
  console.log(`Called from shared function! Project type: ${platform}`);
  //console.log("gggg")
};

const logInWithPassword = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
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
  signOut(auth)
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

export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus
}