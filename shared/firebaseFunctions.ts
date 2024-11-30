import {
  initializeApp,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "../TaskKeeper-web/exportedModules.js";
import firebaseConfig from "./firebaseWebConfig";
import { appStartInfo, platform } from "./shared";
import { FirebaseFunctions } from "./firebaseInterface";

// TODO: is this network-safe? will this work even with network lag?
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// TODO: delet dis later
//connectAuthEmulator(auth, "http://192.168.1.102:9099");

const someSharedFunction = () => {
  console.log(`Called from shared function! Project type: ${platform}`);
};

const logInWithPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, "abc123@gmail.com", "abc123")
    .then((userCredential) => {
      console.log(
        "loooooooooooogged the fuck in! logged in user:" + userCredential.user
      );
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

const signUpUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password).then((user) => {
    console.log(user);
  });
};

export const fbFunctions: FirebaseFunctions = {
  someSharedFunction,
  logInWithPassword,
  logOutUser,
  checkUserStatus,
  checkUserLoginStatus,
};
