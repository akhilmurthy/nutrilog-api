import * as diaryService from '../../services/diaryService';
import { DiaryDoc } from '../../models/diary';

export interface GetDiaryInput {
  date?: string; // ISO date string, defaults to today
}

export interface GetDiaryResult {
  success: boolean;
  message: string;
  diary?: DiaryDoc;
}

export async function executeGetDiary(
  userId: string,
  input: GetDiaryInput
): Promise<GetDiaryResult> {
  const dateStr = input.date || new Date().toISOString().split('T')[0];
  const diaryId = `${userId}_${dateStr}`;

  try {
    const diary = await diaryService.getDiaryById(diaryId, userId);

    return {
      success: true,
      message: `Retrieved diary for ${dateStr}`,
      diary,
    };
  } catch (error: any) {
    if (error.message === 'Diary entry not found') {
      return {
        success: true,
        message: `No diary entry found for ${dateStr}`,
        diary: undefined,
      };
    }
    return {
      success: false,
      message: `Failed to get diary: ${error.message}`,
    };
  }
}
