import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JugadorCard from '../components/jugador/JugadorCard';
import { getJugadores, setDevModeNoAuth, checkAuthStatus } from '../services/api';

const FichaClinicaGeneralPage = () => {
  const [jugadores, setJugadores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [devMode, setDevMode] = useState(true);
  const [authInfo, setAuthInfo] = useState(null);

  const fetchJugadores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsAuthError(false);
      
      const data = await getJugadores();
      console.log('Datos recibidos:', data);
      setJugadores(data);
    } catch (err) {
      console.error('Error completo:', err);
      if (err.isAuthError) {
        setIsAuthError(true);
        setError('Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.');
      } else {
        setError('Error al cargar los jugadores. Por favor, intente nuevamente.');
      }
      console.error('Error fetching jugadores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar estado de autenticación
    const info = checkAuthStatus();
    setAuthInfo(info);
    
    // Activar modo desarrollo por defecto
    setDevModeNoAuth(true);
    
    fetchJugadores();
  }, []);

  const handleToggleDevMode = () => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    setDevModeNoAuth(newDevMode);
    fetchJugadores(); // Intentar cargar jugadores nuevamente
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wanderers-green"></div>
      </div>
    );
  }

  if (isAuthError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6zm-12 1a6 6 0 0112 0v2a6 6 0 01-12 0v-2z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sesión no iniciada</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-4">
              <Link 
                to="/login" 
                className="inline-block bg-wanderers-green text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors"
              >
                Iniciar Sesión
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm mb-2">¿Eres desarrollador? Activa el modo desarrollo para acceder sin autenticación:</p>
                <button
                  onClick={handleToggleDevMode}
                  className="px-4 py-1 border border-yellow-500 text-yellow-700 bg-yellow-50 rounded text-sm hover:bg-yellow-100"
                >
                  {devMode ? 'Desactivar' : 'Activar'} Modo Desarrollo
                </button>
                
                {authInfo && (
                  <div className="mt-2 text-xs text-gray-500 text-left">
                    <p>Estado autenticación: {authInfo.isAuthenticated ? 'Autenticado' : 'No autenticado'}</p>
                    {authInfo.token && <p>Token (parcial): {authInfo.token}</p>}
                    <p>Modo: {authInfo.authMode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de modo desarrollo */}
        {devMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Modo Desarrollo Activado</p>
                <p>Estás usando un bypass de autenticación. No usar en producción.</p>
              </div>
              <button
                onClick={handleToggleDevMode}
                className="px-4 py-1 bg-yellow-200 rounded text-sm hover:bg-yellow-300"
              >
                Desactivar
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-wanderers-green mb-2">
                Fichas Clínicas Generales
              </h1>
              <p className="text-gray-600">
                Seleccione un jugador para ver su ficha clínica completa
              </p>
            </div>
            <Link
              to="/ficha-clinica/jugador/nuevo"
              className="inline-flex items-center px-4 py-2 bg-[#00693E] text-white font-bold rounded-lg shadow-md hover:bg-[#00693E]/90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00693E]"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Añadir Nuevo Jugador
            </Link>
          </div>
        </div>

        {jugadores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg">No hay jugadores registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {jugadores.map((jugador) => (
              <div key={jugador.id} className="transform transition-all duration-200 hover:scale-[1.02] h-full">
                <JugadorCard jugador={jugador} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FichaClinicaGeneralPage; 