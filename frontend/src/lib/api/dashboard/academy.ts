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

export const addAcademy = async (formData: FormData) => {
    const response = await axiosInstance.post("academies", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
} 

export async function deleteAcademy(id: string) {
  const res = await axiosInstance.delete(`academies/${id}`);
  return res.data;
}

export async function getAllAcademies() {
  const res = await axiosInstance.get("academies");
  return res.data.data;
}

export const getAcademyByOwner = async (ownerId: string) => {
  const res = await axiosInstance.get(`academies/owner/${ownerId}`);
  return res.data.data;
};