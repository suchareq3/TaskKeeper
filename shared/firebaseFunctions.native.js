import { getApp, initializeApp } from '@react-native-firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from "@react-native-firebase/auth";
//import firebase from '@react-native-firebase/app';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseConfig from "./firebaseConfig";


const app = getApp();
const auth = getAuth(app)

export const someSharedFunction = () => {
  console.log(`Called from shared function! Project type: ${platform}`);
  //console.log("gggg")
};

export const logInWithPassword = (email, password) => {
  signInWithEmailAndPassword(auth, "abc123@gmail.com", "abc123")
    .then((userCredential) => {
      console.log("logged the fuck in! logged in user:" + userCredential.user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("error during login!: " + error.code + ", " + error.message);
    });
};

export const logOutUser = () => {
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

export const checkUserStatus = () => {
  console.log("current user email: " + JSON.stringify(auth.currentUser));
};
