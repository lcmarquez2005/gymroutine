import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Routine, Set, Exercise, WorkoutSession } from '../types';
import { routineService } from '../services/routine.service';
import { exerciseService } from '../services/exercise.service';
import { workoutService } from '../services/workout.service';
import { offlineSyncService } from '../services/offlineSync.service';

interface WorkoutContextType {
  routines: Routine[];
  exerciseLibrary: Exercise[];
  workoutHistory: WorkoutSession[];
  activeWorkout: Routine | null;
  startWorkout: (routineId: string) => void;
  finishWorkout: (startTime: number) => Promise<WorkoutSession | null>;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<Set>) => void;
  updateExerciseFeedback: (exerciseIndex: number, feedback: Partial<{ jointPain: boolean, possibleInjury: boolean, feelingSick: boolean }>) => void;
  isLoading: boolean;
  addRoutine: (routine: Omit<Routine, 'id'>) => Promise<void>;
  updateRoutine: (id: string, routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  addExerciseToLibrary: (exercise: { name: string; muscleGroup: string; isTimeBased?: boolean }) => Promise<Exercise>;
  deleteExerciseFromLibrary: (id: string) => Promise<void>;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      const pendingWorkouts = offlineSyncService.getPendingWorkouts();
      const pendingHistory: WorkoutSession[] = pendingWorkouts.map(item => ({
        id: item.id,
        routineName: item.payload.routineName,
        date: item.payload.date,
        durationMinutes: item.payload.durationMinutes,
        totalVolume: item.payload.totalVolume,
        completedSets: item.payload.completedSets,
        totalSets: item.payload.totalSets,
        muscleGroupsTrained: item.payload.muscleGroupsTrained,
        exercises: item.payload.exercises?.map((ex, i) => ({
          id: `offline-ex-${i}`,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          restTime: 0,
          sets: ex.sets?.map((s, j) => ({
            id: `offline-set-${j}`,
            reps: s.reps,
            weight: s.weight,
            completed: s.completed
          })) || []
        })) || []
      }));

      try {
        const [fetchedRoutines, fetchedExercises, fetchedHistory] = await Promise.all([
          routineService.getRoutines(),
          exerciseService.getExercises(),
          workoutService.getWorkouts(),
        ]);
        setRoutines(fetchedRoutines);
        setExerciseLibrary(fetchedExercises);
        
        // Cargar historial de la API combinado con pendientes
        setWorkoutHistory([...pendingHistory, ...fetchedHistory]);
      } catch (error) {
        console.error('Error fetching data from API', error);
        // Si falla la API (ej. offline), al menos mostramos el historial pendiente
        setWorkoutHistory(pendingHistory);
      }
      setIsLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      const syncedCount = await offlineSyncService.syncWorkouts();
      if (syncedCount > 0) {
        try {
          const fetchedHistory = await workoutService.getWorkouts();
          setWorkoutHistory(fetchedHistory);
        } catch (e) {
          console.error('Error refetching history after sync', e);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const addRoutine = async (routine: Omit<Routine, 'id'>) => {
    const newRoutine = await routineService.createRoutine(routine);
    setRoutines(prev => [...prev, newRoutine]);
  };

  const updateRoutine = async (id: string, updatedRoutine: Routine) => {
    const newRoutine = await routineService.updateRoutine(id, updatedRoutine);
    setRoutines(prev => prev.map(r => r.id === id ? newRoutine : r));
  };

  const deleteRoutine = async (id: string) => {
    await routineService.deleteRoutine(id);
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const addExerciseToLibrary = async (exercise: { name: string; muscleGroup: string; isTimeBased?: boolean }) => {
    const newExercise = await exerciseService.createExercise(exercise);
    const mergedExercise = { ...newExercise, isTimeBased: exercise.isTimeBased };
    setExerciseLibrary(prev => [...prev, mergedExercise]);
    return mergedExercise;
  };

  const deleteExerciseFromLibrary = async (id: string) => {
    try {
      await exerciseService.deleteExercise(id);
      setExerciseLibrary(prev => prev.filter(ex => ex.id !== id));
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      throw error;
    }
  };

  const startWorkout = (routineId: string) => {
    const routineToStart = routines.find(r => r.id === routineId);
    if (routineToStart && routineToStart.exercises.length > 0) {
      const clonedRoutine = JSON.parse(JSON.stringify(routineToStart));
      clonedRoutine.exercises.forEach((ex: any) => {
        ex.sets.forEach((set: any) => {
          set.completed = false;
          if (set.setType === 'REPS' || !set.setType) {
            set.weight = set.targetWeight !== undefined ? set.targetWeight : 0;
            delete set.reps; // Borramos para que se vea el placeholder
          } else if (set.setType === 'TIME') {
            delete set.reps;
            delete set.weight;
          }
        });
      });
      setActiveWorkout(clonedRoutine);
    } else {
      console.error('Cannot start a routine with no exercises');
    }
  };

  const finishWorkout = async (startTime: number): Promise<WorkoutSession | null> => {
    if (!activeWorkout) return null;

    let totalVolume = 0;
    let completedSets = 0;
    let totalSetsCount = 0;
    const muscleGroupsSet = new Set<string>();

    activeWorkout.exercises.forEach(ex => {
      let exHasCompletedSets = false;
      ex.sets.forEach(set => {
        totalSetsCount++;
        if (set.completed) {
          completedSets++;
          if ((set.setType === 'REPS' || !set.setType) && (set.weight || 0) > 0) {
            totalVolume += ((set.weight || 0) * (set.reps || 0));
          }
          exHasCompletedSets = true;
        }
      });
      if (exHasCompletedSets && ex.muscleGroup) {
        muscleGroupsSet.add(ex.muscleGroup.toLowerCase());
      }
    });

    const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

    const requestPayload = {
      routineName: activeWorkout.name,
      date: new Date().toISOString(),
      durationMinutes,
      totalVolume,
      completedSets,
      totalSets: totalSetsCount,
      muscleGroupsTrained: Array.from(muscleGroupsSet),
      exercises: activeWorkout.exercises.map(ex => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        jointPain: ex.feedback?.jointPain || false,
        possibleInjury: ex.feedback?.possibleInjury || false,
        feelingSick: ex.feedback?.feelingSick || false,
        sets: ex.sets.map(s => ({
          setType: s.setType || 'REPS',
          targetRepRange: s.targetRepRange,
          targetWeight: s.targetWeight,
          targetTimeSeconds: s.targetTimeSeconds,
          reps: s.reps || 0,
          weight: s.weight || 0,
          completed: s.completed,
        })),
      })),
    };

    try {
      const savedSession = await workoutService.createWorkout(requestPayload);
      setWorkoutHistory(prev => [savedSession, ...prev]);
      setActiveWorkout(null);
      return savedSession;
    } catch (error) {
      console.error('Error saving workout session', error);
      // Fallback: guardar localmente en la cola offline
      const fallbackId = `session-offline-${Date.now()}`;
      offlineSyncService.enqueueWorkout(fallbackId, requestPayload);

      const fallbackSession: WorkoutSession = {
        id: fallbackId,
        ...requestPayload,
        exercises: JSON.parse(JSON.stringify(activeWorkout.exercises)),
      };
      setWorkoutHistory(prev => [fallbackSession, ...prev]);
      setActiveWorkout(null);
      return fallbackSession;
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, data: Partial<Set>) => {
    if (!activeWorkout) return;
    const updatedWorkout = { ...activeWorkout };
    const updatedSet = { ...updatedWorkout.exercises[exerciseIndex].sets[setIndex], ...data };
    updatedWorkout.exercises[exerciseIndex].sets[setIndex] = updatedSet;
    setActiveWorkout(updatedWorkout);
  };

  const updateExerciseFeedback = (exerciseIndex: number, feedback: Partial<{ jointPain: boolean, possibleInjury: boolean, feelingSick: boolean }>) => {
    if (!activeWorkout) return;
    const updatedWorkout = { ...activeWorkout };
    const ex = updatedWorkout.exercises[exerciseIndex];
    ex.feedback = { ...ex.feedback, ...feedback } as any;
    setActiveWorkout(updatedWorkout);
  };

  return (
    <WorkoutContext.Provider value={{
      routines,
      exerciseLibrary,
      workoutHistory,
      activeWorkout,
      startWorkout,
      finishWorkout,
      updateSet,
      updateExerciseFeedback,
      isLoading,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addExerciseToLibrary,
      deleteExerciseFromLibrary
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};



