import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return null;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderizar el contenido protegido si está autenticado
  return children;
};

export default ProtectedRoute; 