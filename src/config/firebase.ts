import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin using service account key file
const serviceAccountPath = path.join(__dirname, '../../nutrilog-firebase-admin.json');

initializeApp({
  credential: cert(serviceAccountPath),
});

export const db = getFirestore('nutrilog');