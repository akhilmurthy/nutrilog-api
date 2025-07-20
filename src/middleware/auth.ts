import { Request, Response, RequestHandler, NextFunction } from "express";
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import fs from "fs";
import path from "path";

(function initFirebase() {
  if (admin.apps.length) return;

  const firebaseKeyLocation = process.env.FIREBASE_SERVICE_KEY;
  if (!firebaseKeyLocation) {
    throw new Error(
      "FIREBASE_SERVICE_KEY env var not set – point it to your service‑account JSON file"
    );
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(firebaseKeyLocation), "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
})();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

export interface AuthenticatedRequest extends Request {
  userId: string;
}

function getTokenFromHeader(req: Request): string | null {
  const raw = req.headers["authorization"] || req.headers["Authorization"];
  if (!raw || Array.isArray(raw)) return null;
  const [scheme, token] = raw.split(" ");
  return scheme === "Bearer" ? token : null;
}

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      res.status(401).json({ error: "Missing Authorization header" });
      return;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    (req as AuthenticatedRequest).userId = decoded.uid;
    next();
  } catch (err) {
    console.error("Firebase token verification failed", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export { admin, db };
