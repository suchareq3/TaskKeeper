/* eslint-disable linebreak-style */
/* eslint-disable spaced-comment */
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

const { logger, firestore, https } = require("firebase-functions");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");


// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { log } = require("firebase-functions/logger");
const { admin, messaging } = require("firebase-admin");

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

    //TODO: transakcjeeeeee

    // step 2: create user record in Firestore
    const userUid = user.uid;
    await db
      .collection("users")
      .doc(userUid)
      .set({
        ...extraData,
        createdAt: Date.now(),
      });

    return { success: true, uid: userUid };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new HttpsError("internal", "Error creating new user: " + error);
  }
});

exports.pushNotification = onCall(async (data, context) => {
  const { fcmToken, title, description } = data.data;
  if (!title || !description) {
    throw new HttpsError("invalid-argument", JSON.stringify(data.data));
  }
  try {
    const log = await messaging().sendMulticast({ tokens: [fcmToken], notification: { title: title, body: description } });
    //throw new HttpsError("internal", "Successful! Log: " + log);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw new HttpsError("internal", "Error sending push notification: " + error);
  }
});

exports.pushNotificationHttp = https.onRequest(async (data, context) => { 
  const fcmToken = "dqJ3jUu_R3qLjF-ybRnata:APA91bHmWRk-uMiWu1j3rx9xsw2vlYi68e3WJG6GEa47VsXHAAtq2fdI0_qLLEHaSfRAvPCcyeQMuZlhxQFb12a5cnm6oFV6lbpirrOfdN-lGSQiBdMvUHk";
  const title = "asdfasdf";
  const description = "ffffff";
  //const { fcmToken, title, description } = data;
  // if (!title || !description) {
  //   throw new HttpsError("invalid-argument", JSON.stringify(data.data));
  // }
  try {
    const log = await messaging().send({ token: fcmToken, notification: { title: title, body: description } });
    logger.log("Successful! Log: " + JSON.stringify(log));
    //throw new HttpsError("internal", "Successful! Log: " + log);
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw new HttpsError("internal", "Error sending push notification: " + error);
  }
});
