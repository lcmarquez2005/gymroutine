import { api } from '../api/axios';
import type { Exercise } from '../types';

export const exerciseService = {
  getExercises: async (): Promise<Exercise[]> => {
    const response = await api.get<Exercise[]>('/exercises');
    // Ensure sets and restTime are properly formatted if null
    return response.data.map(ex => ({
      ...ex,
      sets: ex.sets || [],
      restTime: ex.restTime || 0,
    }));
  },

  createExercise: async (data: { name: string; muscleGroup: string }): Promise<Exercise> => {
    const response = await api.post<Exercise>('/exercises', data);
    return {
      ...response.data,
      sets: response.data.sets || [],
      restTime: response.data.restTime || 0,
    };
  },
};
