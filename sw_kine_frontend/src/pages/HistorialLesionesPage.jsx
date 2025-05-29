import React, { useState, useEffect } from 'react';
import { getJugadores, getAllLesionesPorJugador, getHistorialDiarioLesion } from '../services/api';
import HistorialLesionGraph from '../components/HistorialLesionGraph';

const HistorialLesionesPage = () => {
  // Estados principales
  const [jugadores, setJugadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [lesionesJugador, setLesionesJugador] = useState([]);
  const [selectedLesion, setSelectedLesion] = useState(null);
  const [historialSeleccionado, setHistorialSeleccionado] = useState([]);
  
  // Estados de carga
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  const [loadingLesiones, setLoadingLesiones] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'jugadores' | 'lesiones' | 'historial'

  // Cargar jugadores al montar el componente
  useEffect(() => {
    const cargarJugadores = async () => {
      try {
        setLoadingJugadores(true);
        setError(null);
        setErrorType(null);
        const data = await getJugadores({ activo: true });
        setJugadores(data);
      } catch (err) {
        console.error('Error al cargar jugadores:', err);
        setError('No se pudo cargar la lista de jugadores. Por favor, intenta nuevamente.');
        setErrorType('jugadores');
        setJugadores([]);
      } finally {
        setLoadingJugadores(false);
      }
    };

    cargarJugadores();
  }, []);

  // Cargar lesiones cuando cambie el jugador seleccionado
  useEffect(() => {
    const cargarLesiones = async () => {
      if (!selectedJugador) {
        setLesionesJugador([]);
        setError(null);
        setErrorType(null);
        return;
      }

      try {
        setLoadingLesiones(true);
        setError(null);
        setErrorType(null);
        console.log('Cargando lesiones para jugador:', selectedJugador.id);
        const lesiones = await getAllLesionesPorJugador(selectedJugador.id);
        setLesionesJugador(lesiones);
        console.log('Lesiones cargadas:', lesiones);
      } catch (error) {
        console.error('Error al cargar lesiones:', error);
        setError(`No se pudo cargar el historial de lesiones de ${selectedJugador.nombres} ${selectedJugador.apellidos}. Por favor, intenta nuevamente.`);
        setErrorType('lesiones');
        setLesionesJugador([]);
      } finally {
        setLoadingLesiones(false);
      }
    };

    cargarLesiones();
  }, [selectedJugador]);

  // Cargar historial diario cuando cambie la lesión seleccionada
  useEffect(() => {
    const cargarHistorial = async () => {
      if (!selectedLesion) {
        setHistorialSeleccionado([]);
        // No limpiar error aquí para que persista el error de lesiones si existe
        return;
      }

      try {
        setLoadingHistorial(true);
        // Solo limpiar error si es del tipo historial
        if (errorType === 'historial') {
          setError(null);
          setErrorType(null);
        }
        console.log('Cargando historial diario para lesión:', selectedLesion.id);
        const historial = await getHistorialDiarioLesion(selectedLesion.id);
        setHistorialSeleccionado(historial);
        console.log('Historial diario cargado:', historial);
      } catch (error) {
        console.error('Error al cargar historial diario:', error);
        setError(`No se pudo cargar la evolución de la lesión "${selectedLesion.diagnostico_medico}". Por favor, intenta nuevamente.`);
        setErrorType('historial');
        setHistorialSeleccionado([]);
      } finally {
        setLoadingHistorial(false);
      }
    };

    cargarHistorial();
  }, [selectedLesion, errorType]);

  // Filtrar jugadores por término de búsqueda
  const filteredJugadores = jugadores.filter(jugador =>
    `${jugador.nombres} ${jugador.apellidos}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    jugador.rut.includes(searchTerm)
  );

  // Manejar selección de jugador
  const handleJugadorSelect = (jugador) => {
    setSelectedJugador(jugador);
    setSelectedLesion(null);
    setHistorialSeleccionado([]);
    // Limpiar errores de lesiones e historial al cambiar jugador
    if (errorType === 'lesiones' || errorType === 'historial') {
      setError(null);
      setErrorType(null);
    }
  };

  // Manejar selección de lesión
  const handleLesionSelect = (lesion) => {
    setSelectedLesion(lesion);
    setHistorialSeleccionado([]);
    // Limpiar error de historial al cambiar lesión
    if (errorType === 'historial') {
      setError(null);
      setErrorType(null);
    }
    console.log('Lesión seleccionada:', lesion);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  // Función para reintentar según el tipo de error
  const handleRetry = () => {
    clearError();
    if (errorType === 'jugadores') {
      window.location.reload(); // Recargar página para jugadores
    } else if (errorType === 'lesiones' && selectedJugador) {
      // Forzar recarga de lesiones
      setSelectedJugador({...selectedJugador});
    } else if (errorType === 'historial' && selectedLesion) {
      // Forzar recarga de historial
      setSelectedLesion({...selectedLesion});
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener icono de tipo de lesión
  const getTipoLesionIcon = (tipo) => {
    switch (tipo) {
      case 'muscular':
        return '💪';
      case 'ligamentosa':
        return '🦴';
      case 'osea':
        return '🩻';
      case 'tendinosa':
        return '🎯';
      case 'articular':
        return '⚙️';
      default:
        return '🏥';
    }
  };

  // Función para obtener colores de gravedad
  const getGravedadColor = (gravedad) => {
    switch (gravedad) {
      case 'leve':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'grave':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severa':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-wanderers-green">
                Historial de Lesiones
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Revisa el historial completo de lesiones de cada jugador
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Total jugadores</p>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                  <p className="text-xl sm:text-2xl font-bold text-wanderers-green">
                    {loadingJugadores ? (
                      <span className="animate-pulse">--</span>
                    ) : (
                      jugadores.length
                    )}
                  </p>
                  <div className="w-2 h-2 rounded-full bg-wanderers-green"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Error Global */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar datos
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                  <button
                    onClick={clearError}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Panel Izquierdo - Lista de Jugadores */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-wanderers-green">
                  Seleccionar Jugador
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Busca y selecciona un jugador para ver su historial de lesiones
                </p>
              </div>

              <div className="p-4">
                {/* Barra de búsqueda */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-wanderers-green focus:border-wanderers-green sm:text-sm"
                    placeholder="Buscar por nombre o RUT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Lista de jugadores */}
                {loadingJugadores ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center py-4 mb-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wanderers-green"></div>
                      <span className="ml-2 text-gray-600 text-sm">Cargando jugadores...</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-20 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">{error}</p>
                  </div>
                ) : filteredJugadores.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {searchTerm ? 'No se encontraron jugadores con ese criterio' : 'No hay jugadores registrados'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredJugadores.map((jugador) => (
                      <button
                        key={jugador.id}
                        onClick={() => handleJugadorSelect(jugador)}
                        className={`
                          w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
                          ${selectedJugador?.id === jugador.id
                            ? 'border-wanderers-green bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-wanderers-green'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg flex-shrink-0">👤</span>
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {jugador.nombres} {jugador.apellidos}
                              </h3>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">División:</span> {jugador.division_nombre}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">RUT:</span> {jugador.rut}
                              </p>
                            </div>
                          </div>

                          <div className="ml-2 flex-shrink-0">
                            <svg 
                              className={`w-5 h-5 transition-colors duration-200 ${
                                selectedJugador?.id === jugador.id
                                  ? 'text-wanderers-green'
                                  : 'text-gray-400'
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Historial del Jugador */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-wanderers-green">
                  {selectedJugador ? `Historial de ${selectedJugador.nombres} ${selectedJugador.apellidos}` : 'Historial de Lesiones'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedJugador ? 'Registro completo de todas las lesiones' : 'Seleccione un jugador para ver su historial'}
                </p>
              </div>

              <div className="p-6">
                {!selectedJugador ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Seleccione un Jugador
                    </h3>
                    <p className="text-gray-600">
                      Elija un jugador de la lista para ver su historial completo de lesiones
                    </p>
                  </div>
                ) : loadingLesiones ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-wanderers-green border-opacity-20 mx-auto mb-4">
                        <div className="absolute top-0 left-0 h-12 w-12 border-4 border-wanderers-green border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-wanderers-green font-semibold">Cargando historial de lesiones...</p>
                        <p className="text-gray-500 text-sm">
                          Obteniendo el registro completo de {selectedJugador.nombres} {selectedJugador.apellidos}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : lesionesJugador.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-green-500 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin Lesiones Registradas
                    </h3>
                    <p className="text-gray-600">
                      Este jugador no tiene lesiones registradas en el sistema
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        Resumen de Lesiones
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-sm font-medium text-blue-900">Total de Lesiones</p>
                          <p className="text-2xl font-bold text-blue-600">{lesionesJugador.length}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-medium text-red-900">Lesiones Activas</p>
                          <p className="text-2xl font-bold text-red-600">
                            {lesionesJugador.filter(l => l.esta_activa).length}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-sm font-medium text-green-900">Lesiones Recuperadas</p>
                          <p className="text-2xl font-bold text-green-600">
                            {lesionesJugador.filter(l => !l.esta_activa).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lista de Lesiones */}
                    <div className="space-y-4">
                      <h4 className="text-base font-medium text-gray-900">
                        Historial de Lesiones
                      </h4>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {lesionesJugador.map((lesion) => (
                          <div
                            key={lesion.id}
                            onClick={() => handleLesionSelect(lesion)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                              ${selectedLesion?.id === lesion.id
                                ? 'border-wanderers-green bg-green-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-wanderers-green'
                              }
                            `}
                          >
                            {/* Header de la lesión */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-lg">{getTipoLesionIcon(lesion.tipo_lesion)}</span>
                                  <h5 className="font-semibold text-gray-900 text-sm flex-1">
                                    {lesion.diagnostico_medico}
                                  </h5>
                                  {/* Badge de estado prominente */}
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border-2 ${
                                      lesion.esta_activa
                                        ? 'bg-red-100 text-red-900 border-red-300 shadow-sm'
                                        : 'bg-green-100 text-green-900 border-green-300 shadow-sm'
                                    }`}
                                  >
                                    <div 
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        lesion.esta_activa ? 'bg-red-500' : 'bg-green-500'
                                      }`}
                                    ></div>
                                    {lesion.esta_activa ? 'ACTIVA' : 'RECUPERADA'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Inicio:</span>
                                    <span className="ml-1">{formatearFecha(lesion.fecha_lesion)}</span>
                                  </div>
                                  
                                  {lesion.fecha_fin ? (
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="font-medium">Fin:</span>
                                      <span className="ml-1">{formatearFecha(lesion.fecha_fin)}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-orange-600">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="font-medium">En progreso</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium">Región:</span>
                                    <span className="ml-1">{lesion.region_cuerpo_display}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Tipo:</span>
                                    <span className="ml-1">{lesion.tipo_lesion_display}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${getGravedadColor(lesion.gravedad_lesion)}`}
                                >
                                  {lesion.gravedad_lesion_display}
                                </span>
                              </div>
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 text-xs bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <span className="font-semibold text-gray-800">Días estimados:</span>
                                  <span className="ml-1 text-wanderers-green font-bold">{lesion.dias_recuperacion_estimados}</span>
                                </div>
                              </div>
                              
                              {lesion.dias_recuperacion_reales ? (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <span className="font-semibold text-gray-800">Días reales:</span>
                                    <span className="ml-1 text-green-600 font-bold">{lesion.dias_recuperacion_reales}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold">En recuperación...</span>
                                </div>
                              )}
                            </div>

                            {/* Indicador de selección */}
                            {selectedLesion?.id === lesion.id && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-wanderers-green to-green-600 rounded-lg text-white">
                                <div className="flex items-center justify-center">
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-bold text-sm">LESIÓN SELECCIONADA</span>
                                </div>
                                <p className="text-center text-xs mt-1 opacity-90">
                                  Revisa los detalles y evolución abajo
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detalles de la Lesión Seleccionada */}
                    {selectedLesion && (
                      <div className="mt-6 space-y-6">
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-wanderers-green mb-4">
                            📋 Detalles de la Lesión Seleccionada
                          </h4>
                          
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                            {/* Header de la lesión */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getTipoLesionIcon(selectedLesion.tipo_lesion)}</span>
                                <div>
                                  <h5 className="text-xl font-bold text-gray-900">
                                    {selectedLesion.diagnostico_medico}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {selectedJugador.nombres} {selectedJugador.apellidos}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGravedadColor(selectedLesion.gravedad_lesion)}`}
                                >
                                  {selectedLesion.gravedad_lesion_display}
                                </span>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedLesion.esta_activa
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-green-100 text-green-800 border-green-200'
                                  }`}
                                >
                                  {selectedLesion.esta_activa ? 'Activa' : 'Recuperada'}
                                </span>
                              </div>
                            </div>

                            {/* Información detallada */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Fechas */}
                              <div className="space-y-3">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                  📅 Fechas
                                </h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Fecha Inicio:</span>
                                    <span className="text-sm font-medium">{formatearFecha(selectedLesion.fecha_lesion)}</span>
                                  </div>
                                  {selectedLesion.fecha_fin && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Fecha Fin:</span>
                                      <span className="text-sm font-medium">{formatearFecha(selectedLesion.fecha_fin)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Características */}
                              <div className="space-y-3">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                  🔍 Características
                                </h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Tipo:</span>
                                    <span className="text-sm font-medium">{selectedLesion.tipo_lesion_display}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Región:</span>
                                    <span className="text-sm font-medium">{selectedLesion.region_cuerpo_display}</span>
                                  </div>
                                  {selectedLesion.mecanismo_lesion && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Mecanismo:</span>
                                      <span className="text-sm font-medium">{selectedLesion.mecanismo_lesion}</span>
                                    </div>
                                  )}
                                  {selectedLesion.condicion_deportiva && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Condición:</span>
                                      <span className="text-sm font-medium">{selectedLesion.condicion_deportiva}</span>
                                    </div>
                                  )}
                                  {selectedLesion.etapa_temporada && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Etapa:</span>
                                      <span className="text-sm font-medium">{selectedLesion.etapa_temporada}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Recuperación */}
                              <div className="space-y-3">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                  ⏱️ Recuperación
                                </h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Días Estimados:</span>
                                    <span className="text-sm font-medium">{selectedLesion.dias_recuperacion_estimados} días</span>
                                  </div>
                                  {selectedLesion.dias_recuperacion_reales && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Días Reales:</span>
                                      <span className="text-sm font-medium">{selectedLesion.dias_recuperacion_reales} días</span>
                                    </div>
                                  )}
                                  {selectedLesion.partidos_ausente && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Partidos Ausente:</span>
                                      <span className="text-sm font-medium">{selectedLesion.partidos_ausente}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Observaciones */}
                            {selectedLesion.observaciones && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">
                                  📝 Observaciones
                                </h6>
                                <p className="text-sm text-gray-700 bg-white rounded p-3 border">
                                  {selectedLesion.observaciones}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gráfica de Historial Diario */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-wanderers-green mb-4">
                            📈 Evolución Diaria de la Lesión
                          </h4>
                          
                          {loadingHistorial ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wanderers-green mx-auto mb-4"></div>
                              <p className="text-gray-600">Cargando historial diario...</p>
                            </div>
                          ) : historialSeleccionado.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="text-gray-400 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <h5 className="text-lg font-medium text-gray-900 mb-2">
                                Sin Historial Diario
                              </h5>
                              <p className="text-gray-600">
                                Esta lesión no tiene registros de evolución diaria
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <HistorialLesionGraph historial={historialSeleccionado} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialLesionesPage; 
