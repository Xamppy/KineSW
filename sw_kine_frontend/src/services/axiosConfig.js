import axios from 'axios';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',  // Asegurarnos de que todas las peticiones vayan a /api/
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sw_kine_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no estamos intentando renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Por ahora, solo redirigimos al login
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        // Si falla la renovación del token, limpiar datos y redirigir al login
        localStorage.removeItem('sw_kine_access_token');
        localStorage.removeItem('sw_kine_refresh_token');
        localStorage.removeItem('sw_kine_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 