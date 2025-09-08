import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setSessionExpiry = functions.https.onCall(
  async (request) => {
    const uid = request.data?.uid;
    if (!uid) {
      throw new functions.https
        .HttpsError("invalid-argument", "UID is required");
    }

    const expiry = Date.now() + 2 * 60 * 60 * 1000;
    await admin.auth().setCustomUserClaims(uid, {expiry});

    return {success: true, expiry};
  }
);
