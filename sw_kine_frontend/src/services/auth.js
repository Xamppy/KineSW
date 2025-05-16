import axiosInstance from './axiosConfig';

// Constantes para el almacenamiento de tokens
const ACCESS_TOKEN_KEY = 'sw_kine_access_token';
const REFRESH_TOKEN_KEY = 'sw_kine_refresh_token';
const USER_KEY = 'sw_kine_user';

export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register/', userData);
    const { access_token, refresh_token, user } = response.data;
    
    // Guardar tokens y datos del usuario
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return {
      access_token,
      refresh_token,
      user
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/auth/login/', credentials);
    const { access_token, refresh_token, user } = response.data;
    
    // Guardar tokens y datos del usuario
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return {
      access_token,
      refresh_token,
      user
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const verifyToken = async (token) => {
  try {
    const response = await axiosInstance.post('/auth/verify/', { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) throw new Error('No refresh token available');

    const response = await axiosInstance.post('/auth/token/refresh/', {
      refresh
    });

    const { access } = response.data;
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    return access;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getStoredRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!getStoredToken();
}; 