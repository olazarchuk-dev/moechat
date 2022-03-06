import { API_URL } from '../constants';
import { api } from './api';

export const getClientsInUser = async (userId: string) => {
  try {
    const res = await api.get(`${API_URL}/ws/users/${userId}`);
    return Promise.resolve(res);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
