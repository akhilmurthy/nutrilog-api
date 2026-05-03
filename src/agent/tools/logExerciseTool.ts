import * as diaryService from '../../services/diaryService';
import { Exercise } from '../../models/diary';

export interface LogExerciseInput {
  name: string;
  caloriesBurned: number;
  durationMin: number;
  date?: string; // ISO date string YYYY-MM-DD
}

export interface LogExerciseResult {
  success: boolean;
  message: string;
  exercise: Exercise;
}

export async function executeLogExercise(
  userId: string,
  input: LogExerciseInput
): Promise<LogExerciseResult> {
  const dateStr = input.date || new Date().toISOString().split('T')[0];
  const diaryId = `${userId}_${dateStr}`;

  const exercise: Exercise = {
    name: input.name,
    calories: input.caloriesBurned,
    durationMin: input.durationMin,
  };

  try {
    // Try to get existing diary or create new one
    let diary;
    try {
      diary = await diaryService.getDiaryById(diaryId, userId);
    } catch {
      diary = await diaryService.createDiaryEntry(userId, { date: dateStr });
    }

    // Add exercise
    await diaryService.addExercise(diary.id, exercise, userId);

    const dateLabel = input.date ? ` on ${input.date}` : '';
    return {
      success: true,
      message: `Logged "${input.name}" - ${input.durationMin} min, ${input.caloriesBurned} cal burned${dateLabel}`,
      exercise,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to log exercise: ${error.message}`,
      exercise,
    };
  }
}
