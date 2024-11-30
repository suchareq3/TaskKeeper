/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.

const { logger, firestore } = require("firebase-functions");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { log } = require("firebase-functions/logger");

const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

// exports.helloWorld = onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.signUpUser = onCall(async (data, context) => {
  const { email, password, extraData } = data.data;
  if (!email || !password) {
    throw new HttpsError("invalid-argument", JSON.stringify(data.data));
  }

  try {
    //step 1 : create user in Auth
    const user = await auth.createUser({
      email: email,
      password: password,
    });

    // step 2: create user record in Firestore
    const userUid = user.uid;
    await db
      .collection("users")
      .doc(userUid)
      .set({
        ...extraData,
        createdAt: Date.now()
      });

    return { success: true, uid: userUid };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new HttpsError("internal", "Error creating new user: " + error);
  }
})