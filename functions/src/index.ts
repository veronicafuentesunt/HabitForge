/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onUserCreated} from "firebase-functions/v2/auth";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10 });

export const awardoriginbadge = onUserCreated(async (event) => {
  const user = event.data;
  const userId = user.uid;
  const badgeId = "origin_badge";

  logger.info(`Awarding origin badge to user ${userId}`);

  const userBadgesRef = admin.firestore().collection("users").doc(userId).collection("userBadges");

  try {
    await userBadgesRef.doc(badgeId).set({
      earnedAt: admin.firestore.FieldValue.serverTimestamp(),
      badgeId: badgeId,
    });
    logger.info(`Successfully awarded origin badge to user ${userId}`);
  } catch (error) {
    logger.error(`Error awarding origin badge to user ${userId}:`, error);
  }
});

export const ontaskcompleted = onDocumentUpdated("tasks/{taskId}", async (event) => {
  const change = event.data;
  if (!change) {
    return;
  }

  const before = change.before.data();
  const after = change.after.data();

  // Check if the task was just completed
  if (before.completed === false && after.completed === true) {
    const userId = after.userId;
    if (!userId) {
      logger.error("Task document does not have a userId");
      return;
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userBadgesRef = userRef.collection("userBadges");

    try {
      await admin.firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          logger.error(`User document ${userId} not found`);
          return;
        }

        const userData = userDoc.data();
        
        // Task completion count logic
        const newCompletedTasks = (userData.completedTasks || 0) + 1;
        
        // Streak logic
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let lastCompletionDate;
        if (userData.lastTaskCompletionDate) {
            lastCompletionDate = userData.lastTaskCompletionDate.toDate();
            lastCompletionDate = new Date(lastCompletionDate.getFullYear(), lastCompletionDate.getMonth(), lastCompletionDate.getDate());
        }

        let currentStreak = userData.currentStreak || 0;

        if (lastCompletionDate) {
            const diffTime = today.getTime() - lastCompletionDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (diffDays === 1) {
                currentStreak += 1; // Continued streak
            } else if (diffDays > 1) {
                currentStreak = 1; // Reset streak
            }
            // if diffDays is 0, do nothing
        } else {
            currentStreak = 1; // First task ever
        }

        transaction.update(userRef, { 
            completedTasks: newCompletedTasks,
            currentStreak: currentStreak,
            lastTaskCompletionDate: admin.firestore.Timestamp.fromDate(now)
        });

        // Check for "First Steps" badge
        if (newCompletedTasks === 1) {
          const badgeId = "first_steps";
          const badgeRef = userBadgesRef.doc(badgeId);
          const badgeDoc = await transaction.get(badgeRef);
          if (!badgeDoc.exists) {
            transaction.set(badgeRef, {
              earnedAt: admin.firestore.FieldValue.serverTimestamp(),
              badgeId: badgeId,
            });
            logger.info(`Awarded "First Steps" badge to user ${userId}`);
          }
        }

        // Check for "Rising Momentum" badge
        if (newCompletedTasks === 5) {
          const badgeId = "rising_momentum";
          const badgeRef = userBadgesRef.doc(badgeId);
          const badgeDoc = await transaction.get(badgeRef);
          if (!badgeDoc.exists) {
            transaction.set(badgeRef, {
              earnedAt: admin.firestore.FieldValue.serverTimestamp(),
              badgeId: badgeId,
            });
            logger.info(`Awarded "Rising Momentum" badge to user ${userId}`);
          }
        }

        // Check for "Flow Seeker" badge
        if (currentStreak === 3) {
            const badgeId = "flow_seeker";
            const badgeRef = userBadgesRef.doc(badgeId);
            const badgeDoc = await transaction.get(badgeRef);
            if (!badgeDoc.exists) {
                transaction.set(badgeRef, {
                    earnedAt: admin.firestore.FieldValue.serverTimestamp(),
                    badgeId: badgeId,
                });
                logger.info(`Awarded "Flow Seeker" badge to user ${userId}`);
            }
        }
      });
    } catch (error) {
      logger.error(`Error in onTaskCompleted transaction for user ${userId}:`, error);
    }
  }
});