export interface Set {
  id: string;
  setType?: 'REPS' | 'TIME';
  targetRepRange?: string;
  targetWeight?: number;
  targetTimeSeconds?: number;
  reps?: number;
  weight?: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Set[];
  restTime?: number; // Descanso en segundos
  isTimeBased?: boolean;
  feedback?: {
    jointPain: boolean;
    possibleInjury: boolean;
    feelingSick: boolean;
  };
  
  // New backend ExerciseDTO fields
  nameEn?: string;
  nameDe?: string;
  nameEs?: string;
  descriptionEn?: string;
  descriptionDe?: string;
  descriptionEs?: string;
  category?: string;
  forceType?: string;
  mechanic?: string;
  difficulty?: string;
  equipment?: string;
  bodyPart?: string;
  primaryMuscles?: string;
  secondaryMuscles?: string;
  goals?: string;
  tags?: string;
  isUnilateral?: boolean;
  isBodyweight?: boolean;
  instructionsEn?: string;
  instructionsDe?: string;
  instructionsEs?: string;
  tipsEn?: string;
  tipsDe?: string;
  tipsEs?: string;
  met?: number;
  imageStart?: string;
  imagePeak?: string;
  imageMain?: string;
  images?: {
    flat?: {
      start?: string;
      peak?: string;
      main?: string;
    };
  };
  customVideoUrl?: string | null;
  customImageUrl?: string | null;
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
