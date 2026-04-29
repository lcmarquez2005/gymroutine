import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Routine, Set, Exercise, WorkoutSession } from '../types';
import { routineService } from '../services/routine.service';
import { exerciseService } from '../services/exercise.service';

interface WorkoutContextType {
  routines: Routine[];
  exerciseLibrary: Exercise[];
  workoutHistory: WorkoutSession[];
  activeWorkout: Routine | null;
  startWorkout: (routineId: string) => void;
  finishWorkout: (startTime: number) => WorkoutSession | null;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<Set>) => void;
  isLoading: boolean;
  addRoutine: (routine: Omit<Routine, 'id'>) => Promise<void>;
  updateRoutine: (id: string, routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  addExerciseToLibrary: (exercise: { name: string; muscleGroup: string }) => Promise<void>;
  toggleFavoriteRoutine: (id: string) => Promise<void>;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_HISTORY = 'gymroutine_history';

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const [fetchedRoutines, fetchedExercises] = await Promise.all([
          routineService.getRoutines(),
          exerciseService.getExercises()
        ]);
        
        setRoutines(fetchedRoutines);
        setExerciseLibrary(fetchedExercises);
      } catch (error) {
        console.error('Error fetching data from API', error);
      }

      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }

      setIsLoading(false);
    };
    
    // Solo inicializar si hay token, pero por ahora lo llamamos siempre. 
    // Dependiendo de si la API falla retornará 401 y el axios interceptor lo maneja.
    initializeData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(workoutHistory));
    }
  }, [workoutHistory, isLoading]);

  const addRoutine = async (routine: Omit<Routine, 'id'>) => {
    const newRoutine = await routineService.createRoutine(routine);
    setRoutines([...routines, newRoutine]);
  };

  const updateRoutine = async (id: string, updatedRoutine: Routine) => {
    const newRoutine = await routineService.updateRoutine(id, updatedRoutine);
    setRoutines(routines.map(r => r.id === id ? newRoutine : r));
  };

  const deleteRoutine = async (id: string) => {
    await routineService.deleteRoutine(id);
    setRoutines(routines.filter(r => r.id !== id));
  };

  const toggleFavoriteRoutine = async (id: string) => {
    const routine = routines.find(r => r.id === id);
    if (routine) {
      const updatedRoutine = { ...routine, isFavorite: !routine.isFavorite };
      await updateRoutine(id, updatedRoutine);
    }
  };

  const addExerciseToLibrary = async (exercise: { name: string; muscleGroup: string }) => {
    const newExercise = await exerciseService.createExercise(exercise);
    setExerciseLibrary([...exerciseLibrary, newExercise]);
  };

  const startWorkout = (routineId: string) => {
    const routineToStart = routines.find(r => r.id === routineId);
    if (routineToStart && routineToStart.exercises.length > 0) {
      setActiveWorkout(JSON.parse(JSON.stringify(routineToStart)));
    } else {
      console.error('Cannot start a routine with no exercises');
    }
  };

  const finishWorkout = (startTime: number): WorkoutSession | null => {
    if (!activeWorkout) return null;

    let totalVolume = 0;
    let completedSets = 0;
    let totalSetsCount = 0;
    const muscleGroupsTrained = new Set<string>();

    activeWorkout.exercises.forEach(ex => {
      let exHasCompletedSets = false;
      ex.sets.forEach(set => {
        totalSetsCount++;
        if (set.completed) {
          completedSets++;
          totalVolume += (set.weight * set.reps);
          exHasCompletedSets = true;
        }
      });
      if (exHasCompletedSets && ex.muscleGroup) {
        muscleGroupsTrained.add(ex.muscleGroup.toLowerCase());
      }
    });

    const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineName: activeWorkout.name,
      date: new Date().toISOString(),
      durationMinutes,
      totalVolume,
      completedSets,
      totalSets: totalSetsCount,
      muscleGroupsTrained: Array.from(muscleGroupsTrained),
      exercises: JSON.parse(JSON.stringify(activeWorkout.exercises)),
    };

    setWorkoutHistory(prev => [session, ...prev]);
    setActiveWorkout(null);
    return session;
  };

  const updateSet = (exerciseIndex: number, setIndex: number, data: Partial<Set>) => {
    if (!activeWorkout) return;
    
    const updatedWorkout = { ...activeWorkout };
    const updatedSet = { ...updatedWorkout.exercises[exerciseIndex].sets[setIndex], ...data };
    
    updatedWorkout.exercises[exerciseIndex].sets[setIndex] = updatedSet;
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
      isLoading,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addExerciseToLibrary,
      toggleFavoriteRoutine
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
