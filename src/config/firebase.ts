import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin using service account key file
// In production (Cloud Run), the secret is mounted at /secrets/
// In development, use the local file
const productionPath = '/secrets/nutrilog-firebase-admin.json';
const localPath = path.join(__dirname, '../../nutrilog-firebase-admin.json');
const serviceAccountPath = fs.existsSync(productionPath) ? productionPath : localPath;

initializeApp({
  credential: cert(serviceAccountPath),
});

export const db = getFirestore('nutrilog');