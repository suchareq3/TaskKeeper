import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkckycqZ1Vqkq5t9iP-3M6aroYLrm-pcA",
  authDomain: "taskkeeper-studia.firebaseapp.com",
  projectId: "taskkeeper-studia",
  storageBucket: "taskkeeper-studia.firebasestorage.app",
  messagingSenderId: "809772782474",
  appId: "1:809772782474:web:2e2ed1c18f95f2c0e46e73"
};

const app = initializeApp(firebaseConfig);
initializeApp(firebaseConfig);
//const auth = getAuth(app)


// TODO: delet dis later
const auth = getAuth();
connectAuthEmulator(auth, "http://127.0.0.1:9099");

export function konsool() {
  console.log('Konsool: '+ JSON.stringify(auth))
}

export function logInWithPassword(email, password) {
  signInWithEmailAndPassword(auth, 'abc123@gmail.com', 'abc123')
  .then((userCredential) => {
    console.log('logged the fuck in! logged in user:' + userCredential.user)
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log('error during login!: ' + error.code + ", " + error.message)
  });
  
  
}

export function logOutUser() {
  signOut(auth).then(() => {
    console.log("logout successful!")
  }).catch((error) => {
    console.log("something went uh-oh during logging out! oopsie woopsie! >w< " + error)
  })
}

export function checkUserStatus() {
  console.log("current user email: " + JSON.stringify(auth.currentUser))
}