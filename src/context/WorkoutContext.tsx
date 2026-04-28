import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Routine, Set, Exercise, WorkoutSession } from '../types';
import { getMockRoutines } from '../services/routine.service';

interface WorkoutContextType {
  routines: Routine[];
  exerciseLibrary: Exercise[];
  workoutHistory: WorkoutSession[];
  activeWorkout: Routine | null;
  startWorkout: (routineId: string) => void;
  finishWorkout: (startTime: number) => WorkoutSession | null;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<Set>) => void;
  isLoading: boolean;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  addExerciseToLibrary: (exercise: Exercise) => void;
}

export const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_ROUTINES = 'gymroutine_routines';
const LOCAL_STORAGE_KEY_EXERCISES = 'gymroutine_exercises';
const LOCAL_STORAGE_KEY_HISTORY = 'gymroutine_history';

const initialLibrary: Exercise[] = [
  { id: 'lib-1', name: 'Press de Banca', muscleGroup: 'pecho', sets: [] },
  { id: 'lib-2', name: 'Dominadas', muscleGroup: 'espalda', sets: [] },
  { id: 'lib-3', name: 'Sentadillas', muscleGroup: 'piernas', sets: [] },
  { id: 'lib-4', name: 'Curl de Bíceps', muscleGroup: 'biceps', sets: [] },
  { id: 'lib-5', name: 'Press Militar', muscleGroup: 'hombros', sets: [] },
];

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      const savedRoutines = localStorage.getItem(LOCAL_STORAGE_KEY_ROUTINES);
      const savedExercises = localStorage.getItem(LOCAL_STORAGE_KEY_EXERCISES);
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);

      if (savedRoutines) {
        setRoutines(JSON.parse(savedRoutines));
      } else {
        const data = await getMockRoutines();
        setRoutines(data);
        localStorage.setItem(LOCAL_STORAGE_KEY_ROUTINES, JSON.stringify(data));
      }

      if (savedExercises) {
        setExerciseLibrary(JSON.parse(savedExercises));
      } else {
        setExerciseLibrary(initialLibrary);
        localStorage.setItem(LOCAL_STORAGE_KEY_EXERCISES, JSON.stringify(initialLibrary));
      }

      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }

      setIsLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ROUTINES, JSON.stringify(routines));
    }
  }, [routines, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_EXERCISES, JSON.stringify(exerciseLibrary));
    }
  }, [exerciseLibrary, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(workoutHistory));
    }
  }, [workoutHistory, isLoading]);

  const addRoutine = (routine: Routine) => {
    setRoutines([...routines, routine]);
  };

  const updateRoutine = (id: string, updatedRoutine: Routine) => {
    setRoutines(routines.map(r => r.id === id ? updatedRoutine : r));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const addExerciseToLibrary = (exercise: Exercise) => {
    setExerciseLibrary([...exerciseLibrary, exercise]);
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
      addExerciseToLibrary
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};
