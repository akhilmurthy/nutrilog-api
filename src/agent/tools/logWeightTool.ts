import * as userService from '../../services/userService';

export interface LogWeightInput {
  weight: number;
  unit?: 'kg' | 'lb';
  date?: string; // ISO date string YYYY-MM-DD
}

export interface LogWeightResult {
  success: boolean;
  message: string;
  entry?: {
    weight: number;
    unit: string;
    date: string;
  };
}

export async function executeLogWeight(
  userId: string,
  input: LogWeightInput
): Promise<LogWeightResult> {
  try {
    const unit = input.unit || 'lb';
    const date = input.date ? new Date(input.date) : undefined;

    const entry = await userService.addWeightEntry(userId, input.weight, unit, date);

    return {
      success: true,
      message: `Logged ${input.weight} ${unit}`,
      entry: {
        weight: input.weight,
        unit,
        date: entry.date.toISOString().split('T')[0],
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to log weight: ${error.message}`,
    };
  }
}
