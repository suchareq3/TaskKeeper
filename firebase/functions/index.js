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
const { getFirestore, Timestamp, FieldPath } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { log } = require("firebase-functions/logger");
const { admin, messaging } = require("firebase-admin");
const { generate } = require("generate-password");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/firestore");

const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

exports.signUpUser = onCall(async (data, context) => {
  const { email, password, extraData } = data.data;
  if (!email || !password) {
    throw new HttpsError("invalid-argument", "Missing email or password.");
  }

  let user;
  try {
    // Step 1: Create user in Auth
    user = await auth.createUser({
      email: email,
      password: password,
    });
    const user_uid = user.uid;

    // Step 2: Create user record in Firestore
    await db
      .collection("users")
      .doc(user_uid)
      .set({
        ...extraData,
        created_on: Timestamp.now(),
        last_updated_on: Timestamp.now(),
      });

    return { success: true, uid: user_uid };
  } catch (error) {
    logger.error("Error creating user:", error);
    // Rollback: If the Firestore write fails after creating the Auth user, delete the Auth user.
    if (user) {
      try {
        await auth.deleteUser(user.uid);
        logger.log("Rolled back auth user creation due to Firestore error.");
      } catch (deleteError) {
        logger.error("Failed to rollback auth user:", deleteError);
      }
    }
    throw new HttpsError("internal", "Error creating new user: " + error);
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
        members: {
          [uid]: {
            isManager: true,
          },
        },
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
    logger.error("Error creating new project: ", error);
    throw new HttpsError("internal", "Error sending push notification: " + error);
  }
});

exports.refreshProjectInviteCode = onCall(async (data, context) => {
  const { projectId } = data.data;
  logger.log("projectId: ", projectId);
  const inviteCode = await generateInviteCode();
  logger.log("new invite code: ", inviteCode);
  logger.log("projectId: ", projectId);
  try {
    await db
      .collection("projects")
      .doc(projectId)
      .update({
        invite_code: inviteCode,
      })
      .then(() => {
        logger.log("projectId: ", projectId);
        logger.log("new invite code: ", inviteCode);
        return { success: true, inviteCode: inviteCode };
      })
      .catch((error) => {
        throw "Error in refreshProjectInviteCode in cloud functions: " + error;
      });
  } catch (error) {
    logger.error("Error refreshing project invite code: ", error);
    throw new HttpsError("internal", "Error refreshing project invite code: " + error);
  }
});


exports.createNotificationForTaskAssigneeOnTaskReassignment = onDocumentUpdated("tasks/{taskId}", async (event) => {
  // Get the data before and after the update
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  if (!beforeData || !afterData) {
    logger.log("Insufficient task data for update.");
    return;
  }

  // Check if the task assignee changed
  const oldAssigneeUid = beforeData.task_assignee_uid;
  const newAssigneeUid = afterData.task_assignee_uid;

  if (oldAssigneeUid === newAssigneeUid) {
    logger.log("Task assignee remains unchanged.");
    return;
  }

  // Construct the notification record using the task name if available
  const taskName = afterData.task_name;
  const notificationData = {
    title: "Task Reassigned",
    body: `A task has been re-assigned to you: ${taskName}.`,
    // Note: userUids expects an array even for a single UID
    user_uids: [newAssigneeUid],
    created_on: Timestamp.now(),
  };

  try {
    // Get Firestore instance and add a new document to the notifications collection
    const db = getFirestore();
    await db.collection("notifications").add(notificationData);
    logger.log("Notification for task reassignment created.");
  } catch (error) {
    logger.error("Error creating notification for task reassignment:", error);
  }
});


exports.createNotificationForTaskAssigneeOnNewTask = onDocumentCreated("tasks/{taskId}", async (event) => {
  // Get the newly created task document data
  const data = event.data.data();
  if (!data) {
    logger.log("No task data available.");
    return;
  }

  // Extract the UID of the task assignee
  const taskAssigneeUid = data.task_assignee_uid;
  if (!taskAssigneeUid) {
    logger.log("Task does not have an assignee uid.");
    return;
  }
  const taskName = data.task_name;

  // Prepare the notification record
  const notificationData = {
    title: "New Task Assigned",
    body: `You have been assigned a new task: ${taskName}`,
    // Use an array to store user UIDs (even if it's a single UID)
    user_uids: [taskAssigneeUid],
    created_on: Timestamp.now(),
  };

  try {
    // Get Firestore instance and add a new document to the notifications collection
    const db = getFirestore();
    await db.collection("notifications").add(notificationData);
    logger.log("Notification record created for new task.");
  } catch (error) {
    logger.error("Error creating notification record:", error);
  }
});


exports.createNotificationForProjectMembersOnNewMember = onDocumentUpdated("projects/{projectId}", async (event) => {
  // Get the document data before and after the update
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  if (!beforeData || !afterData) {
    logger.log("Insufficient project data.");
    return;
  }

  // Get the 'members' maps. Each is an object with keys as user IDs.
  const beforeMembers = beforeData.members || {};
  const afterMembers = afterData.members || {};

  const beforeMemberIds = Object.keys(beforeMembers);
  const afterMemberIds = Object.keys(afterMembers);

  // Determine which member IDs are new (present in after but not in before)
  const newMemberIds = afterMemberIds.filter((id) => !beforeMemberIds.includes(id));

  if (newMemberIds.length === 0) {
    logger.log("No new members added.");
    return;
  }

  // Determine recipients: all members in the updated project except the newly added ones.
  const recipientIds = afterMemberIds.filter((id) => !newMemberIds.includes(id));

  if (recipientIds.length === 0) {
    logger.log("No existing members to notify.");
    return;
  }

  // Fetch new members' firstName and lastName from the 'users' collection.
  const newMemberNames = await Promise.all(
    newMemberIds.map(async (uid) => {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.first_name && userData.last_name) {
          return `${userData.first_name} ${userData.last_name}`;
        }
      }
      // Fallback to the UID if names are not available
      return uid;
    })
  );

  let nameString;
  if (newMemberNames.length === 1) {
    nameString = newMemberNames[0];
  } else {
    // Join multiple names with commas
    nameString = newMemberNames.join(", ");
  }

  // Prepare the notification record with the new member's name(s)
  const notificationData = {
    title: "New Project Member Added",
    body: `New member${newMemberNames.length > 1 ? "s" : ""} ${nameString} ${newMemberNames.length > 1 ? "have" : "has"} joined your project.`,
    user_uids: recipientIds, // Alert all existing members
    created_on: Timestamp.now(),
  };

  try {
    await db.collection("notifications").add(notificationData);
    logger.log("Notification record created for new project member.");
  } catch (error) {
    logger.error("Error creating notification record:", error);
  }
});


exports.createNotificationForProjectMembersOnReleaseStatusChange = onDocumentUpdated("releases/{releaseId}", async (event) => {
  // Get the release data before and after the update.
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  if (!beforeData || !afterData) {
    logger.log("Insufficient release data.");
    return;
  }

  // Only proceed if the status has changed.
  if (beforeData.status === afterData.status) {
    logger.log("Release status unchanged.");
    return;
  }

  // Extract release details.
  const releaseStatus = afterData.status;
  const releaseName = afterData.name || "Unnamed Release";
  const projectId = afterData.project_id;

  if (!projectId) {
    logger.log("Release document does not contain a project_id.");
    return;
  }

  const db = getFirestore();

  // Fetch the associated project document.
  const projectDoc = await db.collection("projects").doc(projectId).get();
  if (!projectDoc.exists) {
    logger.log("Project not found for project_id:", projectId);
    return;
  }
  const projectData = projectDoc.data();
  const projectName = projectData.name || "Unnamed Project";

  // Extract project members (assumes members is a map with user IDs as keys).
  const members = projectData.members || {};
  const user_uids = Object.keys(members);

  if (user_uids.length === 0) {
    logger.log("No project members found for project:", projectId);
    return;
  }

  // Construct the notification message.
  const notificationData = {
    title: "Release Status Updated",
    body: `The release "${releaseName}" for project "${projectName}" is now "${releaseStatus}".`,
    user_uids, // Notifies all project users.
    created_on: Timestamp.now(),
  };

  try {
    await db.collection("notifications").add(notificationData);
    logger.log("Notification created for release status change.");
  } catch (error) {
    logger.error("Error creating notification:", error);
  }
});


//sends notification to users when a record in the 'notifications' collection is created
exports.handleNewNotification = onDocumentCreated("notifications/{notificationId}", async (event) => {
  const data = event.data.data();
  if (!data) return;

  const { title, body, user_uids } = data;

  if (!user_uids || user_uids.length === 0) {
    logger.log("No user UIDs provided.");
    return;
  }

  try {
    const userDocs = await db.collection("users").where(FieldPath.documentId(), "in", user_uids).get();

 

    const tokens = userDocs.docs.map((doc) => doc.data().fcm_token).filter((token) => token);
    if (tokens.length === 0) {
      logger.log("No valid FCM tokens found.");
      return;
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await messaging().sendEachForMulticast(message);
    logger.log("FCM Response:", response);
  } catch (error) {
    logger.error("Error sending notification:", error);
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