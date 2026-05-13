import { api } from '../api/axios';
import type { WorkoutSession } from '../types';

// DTO que espera el backend para crear una sesión
export interface WorkoutSessionRequest {
  routineName: string;
  date: string;           // ISO 8601
  durationMinutes: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  muscleGroupsTrained: string[];
  exercises: Array<{
    name: string;
    muscleGroup: string;
    sets: Array<{
      reps: number;
      weight: number;
      completed: boolean;
    }>;
  }>;
}

const normalizeSession = (data: any): WorkoutSession => ({
  id: data.id,
  routineName: data.routineName,
  date: data.date,
  durationMinutes: data.durationMinutes,
  totalVolume: data.totalVolume,
  completedSets: data.completedSets,
  totalSets: data.totalSets,
  muscleGroupsTrained: data.muscleGroupsTrained || [],
  exercises: (data.exercises || []).map((ex: any) => ({
    id: ex.id || `ex-${Math.random()}`,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    restTime: ex.restTime || 0,
    sets: (ex.sets || []).map((s: any) => ({
      id: s.id || `set-${Math.random()}`,
      reps: s.reps,
      weight: s.weight,
      completed: s.completed,
    })),
  })),
});

export const workoutService = {
  getWorkouts: async (): Promise<WorkoutSession[]> => {
    const response = await api.get<any>('/workouts');
    const dataArray = Array.isArray(response.data) ? response.data : (response.data.content || []);
    return dataArray.map(normalizeSession);
  },

  createWorkout: async (data: WorkoutSessionRequest): Promise<WorkoutSession> => {
    const response = await api.post<any>('/workouts', data);
    return normalizeSession(response.data);
  },
};
