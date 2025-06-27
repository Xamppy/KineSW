import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSW from '../assets/images/logo-sw.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, canManageUsers, isAdmin, hasRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleLogoClick = () => {
    // Solo navegar al dashboard si no estamos en la página de login o registro
    if (!location.pathname.includes('login') && !location.pathname.includes('register')) {
      navigate('/dashboard');
    }
  };

  const handleLogoKeyDown = (event) => {
    // Activar con Enter o Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLogoClick();
    }
  };

  // Si no hay usuario (páginas públicas), mostrar header simple
  if (!user) {
    return (
      <header className="bg-[#07421a] px-4 py-3 shadow-md">
        <div className="container mx-auto flex items-center justify-center">
          <div className="flex items-center">
            <img 
              src={logoSW} 
              alt="Logo Santiago Wanderers" 
              className="h-12 w-auto mr-4"
            />
            <h1 className="text-white text-xl font-bold whitespace-nowrap">
              Equipo Médico Santiago Wanderers
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#07421a] px-4 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center flex-shrink-0">
          <div 
            role="button"
            onClick={handleLogoClick}
            onKeyDown={handleLogoKeyDown}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
            tabIndex="0"
            aria-label="Ir al Dashboard"
          >
            <img 
              src={logoSW} 
              alt="Logo Santiago Wanderers" 
              className="h-12 w-auto mr-4 hover:opacity-90 transition-opacity duration-200"
            />
          </div>
          <h1 className="text-white text-xl font-bold whitespace-nowrap">
            Equipo Médico Santiago Wanderers
          </h1>
        </div>
        
        {/* Menú de usuario */}
        <div className="flex items-center space-x-4">
          {/* Enlace a gestión de usuarios solo para administradores */}
          {canManageUsers() && (
            <Link
              to="/gestion-usuarios"
              className="hidden md:flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 
                       text-white rounded-lg transition-all duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-white/50"

            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
                />
              </svg>
              Usuarios
            </Link>
          )}

          {/* Menú desplegable de usuario */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 
                       text-white rounded-lg transition-all duration-200 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">
                  {user.first_name?.charAt(0) || user.username?.charAt(0)}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-white text-sm font-medium">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-white/70 text-xs">
                  {user.role || 'Sin rol'}
                </div>
              </div>
              <svg 
                className="w-4 h-4 ml-2 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </button>

            {/* Menú desplegable */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-gray-500">{user.email}</div>
                  <div className="text-gray-500 text-xs">Rol: {user.role || 'Sin rol'}</div>
                </div>
                
                {/* Enlace a gestión de usuarios en móvil */}
                {canManageUsers() && (
                  <Link
                    to="/gestion-usuarios"
                    className="md:hidden block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center">
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
                        />
                      </svg>
                      Gestión de Usuarios
                    </div>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú cuando se hace clic fuera */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header; 