import { api } from '../api/axios';
import type { Routine } from '../types';

export const routineService = {
  getRoutines: async (): Promise<Routine[]> => {
    const response = await api.get<Routine[]>('/routines');
    // Asegurar que las listas anidadas no sean nulas
    return response.data.map(routine => ({
      ...routine,
      assignedDays: routine.assignedDays || [],
      exercises: (routine.exercises || []).map(ex => ({
        ...ex,
        sets: ex.sets || [],
        restTime: ex.restTime || 0,
      }))
    }));
  },

  getRoutineById: async (id: string): Promise<Routine> => {
    const response = await api.get<Routine>(`/routines/${id}`);
    const routine = response.data;
    return {
      ...routine,
      assignedDays: routine.assignedDays || [],
      exercises: (routine.exercises || []).map(ex => ({
        ...ex,
        sets: ex.sets || [],
        restTime: ex.restTime || 0,
      }))
    };
  },

  createRoutine: async (data: Omit<Routine, 'id'>): Promise<Routine> => {
    const response = await api.post<Routine>('/routines', data);
    const routine = response.data;
    return {
      ...routine,
      assignedDays: routine.assignedDays || [],
      exercises: (routine.exercises || []).map(ex => ({
        ...ex,
        sets: ex.sets || [],
        restTime: ex.restTime || 0,
      }))
    };
  },

  updateRoutine: async (id: string, data: Routine): Promise<Routine> => {
    const response = await api.put<Routine>(`/routines/${id}`, data);
    const routine = response.data;
    return {
      ...routine,
      assignedDays: routine.assignedDays || [],
      exercises: (routine.exercises || []).map(ex => ({
        ...ex,
        sets: ex.sets || [],
        restTime: ex.restTime || 0,
      }))
    };
  },

  deleteRoutine: async (id: string): Promise<void> => {
    await api.delete(`/routines/${id}`);
  }
};
