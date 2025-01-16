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

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { log } = require("firebase-functions/logger");
const { admin, messaging } = require("firebase-admin");
const { generate } = require("generate-password");

const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

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

//TODO: this is a PLACEHOLDER function to be replaced when i'll be working on notifications
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

//TODO: this is a PLACEHOLDER function
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

exports.createProject = onCall(async (data, context) => {
  const { name, description, githubUrl, uid } = data.data;
  const createdOn = Timestamp.now();
  const lastUpdatedOn = Timestamp.now();
  const inviteCode = await generateInviteCode();
  try {
    await db
      .collection("projects")
      .add({
        name: name,
        description: description,
        github_url: githubUrl,
        member_uids: [uid],
        created_on: createdOn,
        last_updated_on: lastUpdatedOn,
        invite_code: inviteCode,
      })
      .then((res) => {
        logger.log("project id:, ", res.id);
        return { success: true, projectData: { name: name, description: description, githubUrl: githubUrl, userUid: uid, createdOn: createdOn, lastUpdatedOn: lastUpdatedOn, projectId: res.id } };
      })
      .catch((error) => {
        throw "Error in createProject in cloud functions: " + error;
      });
  } catch (error) {
    console.error("Error creating new project: ", error);
    throw new HttpsError("internal", "Error sending push notification: " + error);
  }
});

exports.getUserProjects = onCall(async (data, context) => {
  const { uid } = data.data;
  try {
    logger.log("UID: " + uid);
    const userProjects = await db.collection("projects").where("member_uids", "array-contains", uid).get();
    logger.log("Projects: " + userProjects);
    const userProjectsData = userProjects.docs.map((doc) => {
      const data = doc.data();
      return {
        projectId: doc.id,
        name: data.name,
        description: data.description,
        githubUrl: data.github_url,
        memberUids: data.member_uids,
        lastUpdatedOn: data.last_updated_on,
        inviteCode: data.invite_code
      };
    });
    return userProjectsData;
  } catch (error) {
    console.error("Error fetching user projects: ", error);
    throw new HttpsError("internal", "Error fetching user projects: " + error);
  }
});



// TODO: there's an edge case where someone may be able to re-use someone's old invite code after it re-generates. is this OK?
const generateInviteCode = async () => {
  const codeGen = () => generate({ length: 8, numbers: true, lowercase: false, uppercase: true, excludeSimilarCharacters: true });
  const codeCheckQuery = (invCode) => db.collection("projects").where("invite_code", "array-contains", invCode);

  let inviteCode = codeGen();
  let userProjects = await codeCheckQuery(inviteCode).get();
  //if inviteCode is already taken by a project, keep re-generating it until you find an available inviteCode
  while (!userProjects.empty) {
    inviteCode = codeGen();
    userProjects = await codeCheckQuery(inviteCode).get();
  }

  return inviteCode;
};