import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requireAdmin = false, 
  requireWrite = false 
}) => {
  const { 
    isAuthenticated, 
    loading, 
    hasRole, 
    isAdmin, 
    canWrite 
  } = useAuth();
  const location = useLocation();

  // Mostrar nada mientras se verifica la autenticación
  if (loading) {
    return null;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si se requiere un rol específico
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar si se requieren permisos de administrador
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar si se requieren permisos de escritura
  if (requireWrite && !canWrite()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Renderizar el contenido protegido si pasa todas las verificaciones
  return children;
};

export default ProtectedRoute; 