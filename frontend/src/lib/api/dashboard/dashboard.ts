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

export const getAllUsers = async () => {
  const res = await axiosInstance.get('users');
  // Return the users array nested inside data.users
  return res.data?.data?.users || [];
};

// export const getUserProfile = async () => {
//   const res = await axiosInstance.get('/profile');
//   return res.data;
// };

// Add a user
export const addUser = async (userData) => {
  try {
    // Use FormData for file uploads
    const formData = new FormData();
    
    // Append all fields
    Object.keys(userData).forEach(key => {
      if (key === 'profilePhoto' && userData[key]) {
        formData.append('profilePhoto', userData.profilePhoto);
      } else if (key !== 'profilePhoto') {
        formData.append(key, userData[key]);
      }
    });

    const response = await axiosInstance.post('users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.data.user;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to add user');
    }
    throw new Error(error.message || 'An error occurred');
  }
};

// Update a user
export const updateUser = async (id, updatedData) => {
  const response = await axiosInstance.put(`users/${id}`, updatedData);
  return response.data.data.user;
};

// Delete a user
export const deleteUser = async (id) => {
  await axiosInstance.delete(`users/${id}`);
};

export const getAllRoles = async () => {
  const res = await axiosInstance.get('roles');
  // Return the roles array nested inside data.roles
  return res.data?.data || [];
}

// Add a role
export const addRole = async (roleData) => {
  try {
    const response = await axiosInstance.post('roles', roleData);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to add role');
    }
    throw new Error(error.message || 'An error occurred');
  }
}

// Update a role
export const updateRole = async (id, updatedData) => {
  const response = await axiosInstance.put(`roles/${id}`, updatedData);
  return response.data.data;
}

// Delete a role
export const deleteRole = async (id) => {
  await axiosInstance.delete(`roles/${id}`);
};