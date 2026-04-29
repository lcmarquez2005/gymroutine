import { api } from '../api/axios';
import type { User } from '../types';

export const getUserMe = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};
