// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  return admin.auth().verifyIdToken(idToken);
}

export { admin };
export default admin;