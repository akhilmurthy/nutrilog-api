export interface UserSettings {
  displayName?: string;
  weightUnit?: 'kg' | 'lb';
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  avatarUrl?: string;
  goalWeight?: number; // Always stored in kg
  // Body metrics for calorie calculation
  currentWeight?: number; // Always stored in kg
  height?: number; // Always stored in cm
  heightUnit?: 'in' | 'cm'; // Display preference only
  dob?: string; // ISO date (yyyy-mm-dd); age is derived from this
  sex?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  weeklyWeightLossGoal?: number; // lbs per week (e.g., 0.5, 1, 1.5, 2)
  // AI Coach settings
  aiCoachEnabled?: boolean;
  aiInsightsFrequency?: 'daily' | 'weekly' | 'off';
  aiMealSuggestions?: boolean;
  aiCoachingStyle?: 'encouraging' | 'data-driven' | 'balanced';
  // Notification settings
  mealReminders?: boolean;
  weeklyReportEnabled?: boolean;
  // Privacy settings
  profileVisibility?: 'private' | 'friends' | 'public';
  shareProgress?: boolean;
}

export interface WeightEntry {
  id: string;
  userId: string;
  weight: number;
  unit: 'kg' | 'lb';
  date: Date;
  createdAt: Date;
}

export interface UserDocument {
  userId: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}
