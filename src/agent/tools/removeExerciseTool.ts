import * as diaryService from '../../services/diaryService';

export interface RemoveExerciseInput {
  exerciseId: string;
  date?: string; // ISO date string, defaults to today
}

export interface RemoveExerciseResult {
  success: boolean;
  message: string;
}

export async function executeRemoveExercise(
  userId: string,
  input: RemoveExerciseInput
): Promise<RemoveExerciseResult> {
  const dateStr = input.date || new Date().toISOString().split('T')[0];
  const diaryId = `${userId}_${dateStr}`;

  try {
    await diaryService.removeExercise(diaryId, input.exerciseId, userId);

    return {
      success: true,
      message: `Removed exercise from diary`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to remove exercise: ${error.message}`,
    };
  }
}
