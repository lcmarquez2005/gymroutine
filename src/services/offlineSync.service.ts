import { workoutService } from './workout.service';
import type { WorkoutSessionRequest } from './workout.service';

const QUEUE_KEY = 'offline_workout_queue';

export interface QueuedWorkout {
  id: string; // ID temporal de fallback
  payload: WorkoutSessionRequest;
  timestamp: number;
}

export const offlineSyncService = {
  getPendingWorkouts(): QueuedWorkout[] {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  },

  enqueueWorkout(id: string, payload: WorkoutSessionRequest): void {
    const queue = this.getPendingWorkouts();
    queue.push({
      id,
      payload,
      timestamp: Date.now(),
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  clearQueue(): void {
    localStorage.removeItem(QUEUE_KEY);
  },

  removeWorkout(id: string): void {
    const queue = this.getPendingWorkouts();
    const newQueue = queue.filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
  },

  async syncWorkouts(): Promise<number> {
    const queue = this.getPendingWorkouts();
    if (queue.length === 0) return 0;

    let successCount = 0;

    for (const item of queue) {
      try {
        await workoutService.createWorkout(item.payload);
        this.removeWorkout(item.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync workout ${item.id} during background sync`, error);
        // Falló por error de red o de servidor, se deja en la cola para intentarlo después
      }
    }

    return successCount;
  }
};
