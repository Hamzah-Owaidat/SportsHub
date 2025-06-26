import { Tournament, TournamentPayload } from '@/types/Tournament';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get token from localStorage (only safe to use on the client side)
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create Axios instance with token
const axiosInstance = axios.create({
  baseURL: `${API_URL}/dashboard/`,
});

// Add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllTournaments = async (): Promise<Tournament[]> => {
  const res = await axiosInstance.get("tournaments");
  return res.data.data;
};

export const getMyTournaments = async (): Promise<Tournament[]> => {
  const res = await axiosInstance.get("my-tournaments");
  return res.data.data;
};

export const addTournament = async (payload: TournamentPayload) => {
  const res = await axiosInstance.post("tournaments", payload);
  return res.data;
};