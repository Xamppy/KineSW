import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredToken, getStoredUser, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

// Constantes para el almacenamiento - usar las mismas que en auth.js
const ACCESS_TOKEN_KEY = 'sw_kine_access_token';
const REFRESH_TOKEN_KEY = 'sw_kine_refresh_token';
const USER_KEY = 'sw_kine_user';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos almacenados al iniciar
  useEffect(() => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error al cargar datos de autenticación:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar token y usuario
  const saveAuthData = (accessToken, refreshToken, userData) => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(userData);
    } catch (error) {
      console.error('Error al guardar datos de autenticación:', error);
    }
  };

  // Función de login
  const login = (accessToken, refreshToken, userData) => {
    try {
      saveAuthData(accessToken, refreshToken, userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('AuthContext - Error en login:', error);
      throw error;
    }
  };

  // Función de logout
  const logout = () => {
    authLogout(); // Usar la función de logout de auth.js
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    navigate('/login');
  };

  // Actualizar access token
  const updateAccessToken = (newToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
    setAccessToken(newToken);
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!accessToken && !!user;
  };

  // Obtener el token actual
  const getToken = () => {
    return accessToken;
  };

  // Obtener el usuario actual
  const getUser = () => {
    return user;
  };

  // Funciones auxiliares para verificar roles
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return hasRole('Administrador');
  };

  const isMedico = () => {
    return hasRole('Cuerpo médico');
  };

  const isTecnico = () => {
    return hasRole('Cuerpo técnico');
  };

  const isDirigencia = () => {
    return hasRole('Dirigencia');
  };

  // Verificar si el usuario puede escribir (crear/editar)
  const canWrite = () => {
    return isAdmin() || isMedico();
  };

  // Verificar si el usuario puede solo leer
  const canOnlyRead = () => {
    return isTecnico() || isDirigencia();
  };

  // Verificar si el usuario puede gestionar otros usuarios
  const canManageUsers = () => {
    return isAdmin();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
        updateAccessToken,
        isAuthenticated,
        getToken,
        getUser,
        // Funciones de roles
        hasRole,
        isAdmin,
        isMedico,
        isTecnico,
        isDirigencia,
        canWrite,
        canOnlyRead,
        canManageUsers,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext; 