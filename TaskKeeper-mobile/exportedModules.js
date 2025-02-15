export { getApp, initializeApp } from "@react-native-firebase/app";
export { default as auth, getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "@react-native-firebase/auth";
export { default as firestore, getFirestore, runTransaction, arrayUnion, arrayRemove, FieldValue, Timestamp } from "@react-native-firebase/firestore";

export { getFunctions, httpsCallable } from "@react-native-firebase/functions";
export { default as messaging } from "@react-native-firebase/messaging";

//import firestore from '@react-native-firebase/firestore';
//export default firestore;
  