import type { User } from '../types';

export const getMockUser = async (): Promise<User> => {
  // Simular retraso de red
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user-1',
        name: 'Alex Márquez',
        email: 'alex@example.com',
        training_days: [
          {
            date: '2023-10-25',
            muscleGroupsTrained: ['pecho', 'triceps']
          },
          {
            date: '2023-10-26',
            muscleGroupsTrained: ['espalda', 'biceps']
          },
          {
            date: '2023-10-28',
            muscleGroupsTrained: ['piernas', 'hombros']
          }
        ]
      });
    }, 800);
  });
};
