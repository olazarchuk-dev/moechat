import { API_URL } from '../constants';
import { Client } from "../types/client"
import { api } from './api'

export const registerService = async (data : Client) => {
  try {
    const res = await api.post(`${API_URL}/register`, data);
    return Promise.resolve(res);
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
