import type { Routine } from '../types';

const mockRoutines: Routine[] = [
  {
    id: 'routine-1',
    name: 'Pecho y Tríceps',
    targetMuscleGroup: 'pecho',
    assignedDays: ['lunes', 'jueves'],
    exercises: [
      {
        id: 'ex-1',
        name: 'Press de Banca',
        muscleGroup: 'pecho',
        sets: [
          { id: 'set-1', reps: 10, weight: 60, completed: false },
          { id: 'set-2', reps: 10, weight: 60, completed: false },
          { id: 'set-3', reps: 8, weight: 65, completed: false }
        ]
      },
      {
        id: 'ex-2',
        name: 'Extensión de Tríceps',
        muscleGroup: 'triceps',
        sets: [
          { id: 'set-4', reps: 12, weight: 20, completed: false },
          { id: 'set-5', reps: 12, weight: 20, completed: false }
        ]
      }
    ]
  },
  {
    id: 'routine-2',
    name: 'Espalda y Bíceps',
    targetMuscleGroup: 'espalda',
    assignedDays: ['martes', 'viernes'],
    exercises: [
      {
        id: 'ex-3',
        name: 'Dominadas',
        muscleGroup: 'espalda',
        sets: [
          { id: 'set-6', reps: 8, weight: 0, completed: false },
          { id: 'set-7', reps: 8, weight: 0, completed: false }
        ]
      },
      {
        id: 'ex-4',
        name: 'Curl de Bíceps',
        muscleGroup: 'biceps',
        sets: [
          { id: 'set-8', reps: 12, weight: 15, completed: false },
          { id: 'set-9', reps: 10, weight: 15, completed: false }
        ]
      }
    ]
  },
  {
    id: 'routine-3',
    name: 'Piernas y Hombros',
    targetMuscleGroup: 'piernas',
    assignedDays: ['miercoles', 'sabado'],
    exercises: [
      {
        id: 'ex-5',
        name: 'Sentadillas',
        muscleGroup: 'piernas',
        sets: [
          { id: 'set-10', reps: 10, weight: 80, completed: false },
          { id: 'set-11', reps: 10, weight: 80, completed: false }
        ]
      }
    ]
  }
];

export const getMockRoutines = async (): Promise<Routine[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRoutines);
    }, 500);
  });
};
