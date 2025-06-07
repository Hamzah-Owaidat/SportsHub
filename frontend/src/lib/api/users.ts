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
  baseURL: `${API_URL}/dashboard/users`,
});

// Add token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserProfile = async () => {
  const res = await axiosInstance.get('/profile');
  return res.data;
};

export const updateUser = async (userId: string, data: any) => {
  const res = await axiosInstance.put(`/${userId}`, data);
  return res.data;
};

export const deleteUser = async (userId: string) => {
  const res = await axiosInstance.delete(`/${userId}`);
  return res.data;
};
