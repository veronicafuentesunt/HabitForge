/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

export const share = onCall(async (request) => {
  const { friendId, amount, type } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const db = admin.firestore();

  const senderRef = db.collection("users").doc(uid);
  const receiverRef = db.collection("users").doc(friendId);

  return db.runTransaction(async (transaction) => {
    const senderDoc = await transaction.get(senderRef);
    const receiverDoc = await transaction.get(receiverRef);

    if (!senderDoc.exists || !receiverDoc.exists) {
      throw new HttpsError("not-found", "User not found.");
    }

    const senderData = senderDoc.data();
    if (!senderData) {
      throw new HttpsError("internal", "Sender data not found.");
    }
    const currentAmount = type === "XP" ? senderData.xp : senderData.coins;

    if (currentAmount < amount) {
      throw new HttpsError(
        "failed-precondition",
        "Insufficient funds."
      );
    }

    const senderUpdate = {};
    senderUpdate[type.toLowerCase()] = admin.firestore.FieldValue.increment(-amount);
    transaction.update(senderRef, senderUpdate);

    const receiverUpdate = {};
    receiverUpdate[type.toLowerCase()] = admin.firestore.FieldValue.increment(amount);
    transaction.update(receiverRef, receiverUpdate);

    return { success: true };
  });
});
