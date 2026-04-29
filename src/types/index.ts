export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
  restTime?: number; // Descanso en segundos
}

export interface Routine {
  id: string;
  name: string;
  targetMuscleGroup: string;
  exercises: Exercise[];
  assignedDays?: string[];
}

export interface TrainingDay {
  date: string; // Formato ISO 8601 (ej. '2023-10-27')
  muscleGroupsTrained: string[]; // ej. ['pecho', 'triceps']
}

export interface User {
  id: string;
  name: string;
  email: string;
  trainingDays: TrainingDay[];
}

export interface WorkoutSession {
  id: string;
  routineName: string;
  date: string;
  durationMinutes: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  muscleGroupsTrained: string[];
  exercises?: Exercise[];
}
