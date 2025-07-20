import User, { UserDocument } from "../models/user";

export interface UserSettings {
  displayName?: string;
  weightUnit?: "kg" | "lb";
  calorieGoal?: number;
  avatarUrl?: string;
  [key: string]: unknown;
}

export async function createUser(
  userId: string,
  settings: UserSettings = {}
): Promise<UserDocument> {
  return User.create({ userId, settings });
}

export async function getUserById(
  userId: string
): Promise<UserDocument | null> {
  return User.findOne({ userId }).lean<UserDocument>().exec();
}

export async function updateUser(
  userId: string,
  patch: Partial<UserSettings>
): Promise<UserDocument | null> {
  return User.findOneAndUpdate(
    { userId },
    {
      $set: Object.fromEntries(
        Object.entries(patch).map(([k, v]) => [`settings.${k}`, v])
      ),
    },
    { new: true }
  )
    .lean<UserDocument>()
    .exec();
}

export async function deleteUser(userId: string): Promise<boolean> {
  const result = await User.deleteOne({ userId }).exec();
  return result.deletedCount === 1;
}
