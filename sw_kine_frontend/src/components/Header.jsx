import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSW from '../assets/images/logo-sw.png';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem('token');
    // Mostrar mensaje de éxito
    toast.success('Sesión cerrada exitosamente');
    // Redirigir al login
    navigate('/login');
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

  return (
    <header className="bg-wanderers-green px-4 py-3 shadow-md">
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
          <h1 className="text-wanderers-white text-xl font-bold whitespace-nowrap">
            Equipo Médico Santiago Wanderers
          </h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 
                   text-wanderers-green rounded-lg transition-all duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-white/50 ml-4"
          aria-label="Cerrar sesión"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          <span className="hidden sm:inline">Cerrar Sesión</span>
          <span className="sm:hidden">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 