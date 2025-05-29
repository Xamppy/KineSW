import React, { useState, useEffect } from 'react';
import { getJugadores, getAllLesionesPorJugador, getHistorialDiarioLesion } from '../services/api';

const HistorialLesionesPage = () => {
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historialLesiones, setHistorialLesiones] = useState([]);
  const [error, setError] = useState(null);

  // Cargar jugadores al montar el componente
  useEffect(() => {
    const cargarJugadores = async () => {
      try {
        setLoadingJugadores(true);
        setError(null);
        const data = await getJugadores({ activo: true });
        setJugadores(data);
      } catch (err) {
        console.error('Error al cargar jugadores:', err);
        setError('Error al cargar la lista de jugadores');
      } finally {
        setLoadingJugadores(false);
      }
    };

    cargarJugadores();
  }, []);

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

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para seleccionar jugador y cargar su historial
  const handleJugadorSelect = async (jugador) => {
    setSelectedJugador(jugador);
    setLoadingHistorial(true);
    setError(null);
    
    try {
      console.log('Cargando historial de lesiones para jugador:', jugador.id);
      const lesiones = await getAllLesionesPorJugador(jugador.id);
      setHistorialLesiones(lesiones);
      console.log('Lesiones cargadas:', lesiones);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial de lesiones');
      setHistorialLesiones([]);
    } finally {
      setLoadingHistorial(false);
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
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Columna Izquierda - Lista de Jugadores */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-wanderers-green">
                  Seleccionar Jugador
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Elige un jugador para ver su historial de lesiones
                </p>
              </div>

              <div className="p-4">
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
                ) : jugadores.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">No hay jugadores registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jugadores.map((jugador) => (
                      <div
                        key={jugador.id}
                        onClick={() => handleJugadorSelect(jugador)}
                        className={`
                          p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha - Historial del Jugador Seleccionado */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-wanderers-green">
                  {selectedJugador ? `Historial de ${selectedJugador.nombres} ${selectedJugador.apellidos}` : 'Historial de Lesiones'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedJugador ? 'Registro completo de todas las lesiones' : 'Selecciona un jugador para ver su historial'}
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
                      Selecciona un Jugador
                    </h3>
                    <p className="text-gray-600">
                      Elige un jugador de la lista para ver su historial completo de lesiones
                    </p>
                  </div>
                ) : loadingHistorial ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wanderers-green mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando historial de lesiones...</p>
                  </div>
                ) : historialLesiones.length === 0 ? (
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
                  <div className="space-y-6">
                    {historialLesiones.map((lesion) => (
                      <div
                        key={lesion.id}
                        className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6"
                      >
                        {/* Header de la lesión */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{getTipoLesionIcon(lesion.tipo_lesion)}</span>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {lesion.diagnostico_medico}
                              </h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Fecha: {formatearFecha(lesion.fecha_lesion)}
                              </span>
                              
                              {lesion.fecha_fin && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Fin: {formatearFecha(lesion.fecha_fin)}
                                </span>
                              )}
                              
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {lesion.region_cuerpo_display}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:items-end space-y-2 mt-3 sm:mt-0">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getGravedadColor(lesion.gravedad_lesion)}`}
                            >
                              {lesion.gravedad_lesion_display}
                            </span>
                            
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                lesion.esta_activa
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}
                            >
                              {lesion.esta_activa ? 'Activa' : 'Recuperada'}
                            </span>
                          </div>
                        </div>

                        {/* Información adicional */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-gray-500 font-medium mb-1">Tipo de Lesión</p>
                            <p className="text-gray-900">{lesion.tipo_lesion_display}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-gray-500 font-medium mb-1">Días Estimados</p>
                            <p className="text-gray-900">{lesion.dias_recuperacion_estimados} días</p>
                          </div>
                          
                          {lesion.dias_recuperacion_reales && (
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-gray-500 font-medium mb-1">Días Reales</p>
                              <p className="text-gray-900">{lesion.dias_recuperacion_reales} días</p>
                            </div>
                          )}
                        </div>

                        {/* Botón para ver detalles/gráfica (futuro) */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            className="inline-flex items-center px-3 py-2 border border-wanderers-green text-sm font-medium rounded-md text-wanderers-green bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green transition-colors duration-200"
                            onClick={() => {
                              // TODO: Implementar vista detallada con gráfica usando getHistorialDiarioLesion
                              console.log('Ver detalles de lesión:', lesion.id);
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Ver Evolución Detallada
                          </button>
                        </div>
                      </div>
                    ))}
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