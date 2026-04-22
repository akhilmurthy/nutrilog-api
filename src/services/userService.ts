import { db } from "../config/firebase";
import { UserDocument, UserSettings, WeightEntry } from "../models/user";
import { DiaryDoc } from "../models/diary";

const USERS_COLLECTION = "users";
const DIARIES_COLLECTION = "diaries";
const WEIGHTS_COLLECTION = "weights";

export async function createUser(
  userId: string,
  settings: UserSettings = {}
): Promise<UserDocument> {
  const now = new Date();
  const userData: UserDocument = {
    userId,
    settings,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection(USERS_COLLECTION).doc(userId).set(userData);
  return userData;
}

export async function getUserById(
  userId: string
): Promise<UserDocument | null> {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  
  if (!doc.exists) {
    return null;
  }

  return doc.data() as UserDocument;
}

export async function updateUser(
  userId: string,
  patch: Partial<UserSettings>
): Promise<UserDocument> {
  const userRef = db.collection(USERS_COLLECTION).doc(userId);
  const now = new Date();

  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    const newUser: UserDocument = {
      userId,
      settings: patch,
      createdAt: now,
      updatedAt: now,
    };
    await userRef.set(newUser);
    return newUser;
  }

  const updates: any = {
    updatedAt: now,
  };

  // Update settings fields
  Object.entries(patch).forEach(([key, value]) => {
    updates[`settings.${key}`] = value;
  });

  await userRef.update(updates);

  // Return updated user
  const updatedDoc = await userRef.get();
  return updatedDoc.data() as UserDocument;
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await db.collection(USERS_COLLECTION).doc(userId).delete();
    return true;
  } catch (error) {
    return false;
  }
}

export async function getDiaryByDate(userId: string, date: string): Promise<DiaryDoc> {
  const dateKey = new Date(date).toISOString().split('T')[0];
  const docId = `${userId}_${dateKey}`;

  const doc = await db.collection(DIARIES_COLLECTION).doc(docId).get();

  if (!doc.exists) {
    // Create a new diary entry for this date if it doesn't exist
    const now = new Date();
    const diaryDoc: DiaryDoc = {
      id: docId,
      userId: userId,
      date: new Date(date),
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(DIARIES_COLLECTION).doc(docId).set(diaryDoc);
    return diaryDoc;
  }

  return doc.data() as DiaryDoc;
}

// Helper to sync current weight to user settings
async function syncCurrentWeightToSettings(userId: string): Promise<void> {
  const { entries } = await getWeightHistory(userId, 1, 0);
  if (entries.length > 0) {
    const latest = entries[0];
    await updateUser(userId, { currentWeight: latest.weight });
  }
}

// Weight conversion helpers (database always stores kg)
const lbToKg = (lb: number): number => lb * 0.453592;
const kgToLb = (kg: number): number => kg * 2.20462;

// Weight tracking functions
export async function addWeightEntry(
  userId: string,
  weight: number,
  unit: 'kg' | 'lb',
  date?: Date
): Promise<WeightEntry> {
  const now = new Date();
  const entryDate = date || now;
  const dateKey = entryDate.toISOString().split('T')[0];
  const docId = `${userId}_${dateKey}`;

  // Always store weight in kg
  const weightKg = unit === 'lb' ? lbToKg(weight) : weight;

  const weightEntry: WeightEntry = {
    id: docId,
    userId,
    weight: weightKg,
    unit: 'kg', // Always store as kg
    date: entryDate,
    createdAt: now,
  };

  await db.collection(WEIGHTS_COLLECTION).doc(docId).set(weightEntry);

  // Sync current weight to user settings (in kg)
  await syncCurrentWeightToSettings(userId);

  return weightEntry;
}

export async function getWeightHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ entries: WeightEntry[]; hasMore: boolean }> {
  // Fetch one extra to determine if there are more entries
  let query = db
    .collection(WEIGHTS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('date', 'desc');

  if (offset > 0) {
    // For offset-based pagination, we need to skip documents
    const skipSnapshot = await db
      .collection(WEIGHTS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(offset)
      .get();

    if (skipSnapshot.docs.length > 0) {
      const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
      query = query.startAfter(lastDoc);
    }
  }

  const snapshot = await query.limit(limit + 1).get();
  const entries = snapshot.docs.slice(0, limit).map(doc => doc.data() as WeightEntry);
  const hasMore = snapshot.docs.length > limit;

  return { entries, hasMore };
}

export async function updateWeightEntry(
  userId: string,
  entryId: string,
  weight: number,
  unit: 'kg' | 'lb'
): Promise<WeightEntry | null> {
  const doc = await db.collection(WEIGHTS_COLLECTION).doc(entryId).get();

  if (!doc.exists) {
    return null;
  }

  const entry = doc.data() as WeightEntry;
  if (entry.userId !== userId) {
    return null;
  }

  // Always store weight in kg
  const weightKg = unit === 'lb' ? lbToKg(weight) : weight;

  const updatedEntry: WeightEntry = {
    ...entry,
    weight: weightKg,
    unit: 'kg', // Always store as kg
  };

  await db.collection(WEIGHTS_COLLECTION).doc(entryId).set(updatedEntry);

  // Sync current weight to user settings (in case this was the latest entry)
  await syncCurrentWeightToSettings(userId);

  return updatedEntry;
}

export async function deleteWeightEntry(
  userId: string,
  entryId: string
): Promise<boolean> {
  const doc = await db.collection(WEIGHTS_COLLECTION).doc(entryId).get();

  if (!doc.exists) {
    return false;
  }

  const entry = doc.data() as WeightEntry;
  if (entry.userId !== userId) {
    return false;
  }

  await db.collection(WEIGHTS_COLLECTION).doc(entryId).delete();

  // Sync current weight to user settings (get new latest after deletion)
  await syncCurrentWeightToSettings(userId);

  return true;
}
