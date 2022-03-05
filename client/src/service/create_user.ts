import { AxiosResponse } from 'axios';
import { api } from './/api';
import { API_URL } from '../constants';

type User = {
  roomName: string;
  roomId: string;
};

export async function createUserService(
  data: User
): Promise<AxiosResponse<any, any>> {
  try {
    const res = await api.post(`${API_URL}/ws`, data);
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err);
  }
}
