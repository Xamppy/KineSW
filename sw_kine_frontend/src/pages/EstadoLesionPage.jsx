import React, { useState, useEffect } from 'react';
import { getJugadoresConLesionActiva, addEstadoDiario, getHistorialDiarioLesion, finalizarLesion } from '../services/api';
import { toast } from 'react-toastify';
import HistorialLesionGraph from '../components/HistorialLesionGraph';

const EstadoLesionPage = () => {
  const [jugadoresActivos, setJugadoresActivos] = useState([]);
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  const [error, setError] = useState(null);
  const [estadoSeleccionadoHoy, setEstadoSeleccionadoHoy] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [historialJugador, setHistorialJugador] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [finalizandoLesion, setFinalizandoLesion] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState(null);

  useEffect(() => {
    const cargarJugadoresConLesiones = async () => {
      try {
        setLoadingJugadores(true);
        setError(null);
        const data = await getJugadoresConLesionActiva();
        setJugadoresActivos(data);
        console.log('Jugadores con lesiones activas cargados:', data);
      } catch (err) {
        console.error('Error al cargar jugadores con lesiones activas:', err);
        setError('Error al cargar la lista de jugadores con lesiones activas');
        toast.error('Error al cargar la lista de jugadores con lesiones activas');
      } finally {
        setLoadingJugadores(false);
      }
    };

    cargarJugadoresConLesiones();
  }, []);

  // Nuevo useEffect para cargar el historial cuando cambia el jugador seleccionado
  useEffect(() => {
    const cargarHistorialJugador = async () => {
      if (!selectedJugador) {
        setHistorialJugador([]);
        setErrorHistorial(null);
        return;
      }

      try {
        setLoadingHistorial(true);
        setErrorHistorial(null);
        console.log('Cargando historial para lesión ID:', selectedJugador.id);
        const historial = await getHistorialDiarioLesion(selectedJugador.id);
        setHistorialJugador(historial);
        console.log('Historial cargado:', historial);
      } catch (error) {
        console.error('Error al cargar historial del jugador:', error);
        setErrorHistorial('Error al cargar el historial del jugador');
        toast.error('Error al cargar el historial del jugador');
        setHistorialJugador([]);
      } finally {
        setLoadingHistorial(false);
      }
    };

    cargarHistorialJugador();
  }, [selectedJugador]);

  // Función para recargar jugadores (botón retry)
  const recargarJugadores = async () => {
    try {
      setLoadingJugadores(true);
      setError(null);
      const data = await getJugadoresConLesionActiva();
      setJugadoresActivos(data);
      toast.success('Lista de jugadores actualizada');
    } catch (err) {
      console.error('Error al recargar jugadores:', err);
      setError('Error al cargar la lista de jugadores con lesiones activas');
      toast.error('Error al recargar la lista de jugadores');
    } finally {
      setLoadingJugadores(false);
    }
  };

  // Función para recargar historial (botón retry)
  const recargarHistorial = async () => {
    if (!selectedJugador) return;
    
    try {
      setLoadingHistorial(true);
      const historial = await getHistorialDiarioLesion(selectedJugador.id);
      setHistorialJugador(historial);
      toast.success('Historial actualizado');
    } catch (error) {
      console.error('Error al recargar historial:', error);
      toast.error('Error al recargar el historial');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleJugadorSelect = (jugadorLesion) => {
    console.log('Jugador seleccionado:', jugadorLesion);
    setSelectedJugador(jugadorLesion);
    // Resetear la selección de estado cuando se cambia de jugador
    setEstadoSeleccionadoHoy('');
  };

  const handleGuardarEstado = async () => {
    if (!estadoSeleccionadoHoy) {
      toast.warning('Por favor selecciona un estado antes de guardar');
      return;
    }

    if (!selectedJugador) {
      toast.error('No hay jugador seleccionado');
      return;
    }

    try {
      setGuardandoEstado(true);
      
      // Obtener la fecha de hoy en formato YYYY-MM-DD
      const fechaHoy = new Date().toISOString().split('T')[0];
      
      console.log('Guardando estado:', {
        lesionId: selectedJugador.id,
        estado: estadoSeleccionadoHoy,
        fecha: fechaHoy
      });

      await addEstadoDiario(
        selectedJugador.id,
        estadoSeleccionadoHoy,
        fechaHoy,
        `Estado registrado desde el panel de seguimiento`
      );

      toast.success('Estado del día guardado correctamente');
      
      // Resetear la selección después de guardar
      setEstadoSeleccionadoHoy('');
      
      // Recargar el historial para mostrar el nuevo estado
      try {
        const historialActualizado = await getHistorialDiarioLesion(selectedJugador.id);
        setHistorialJugador(historialActualizado);
      } catch (error) {
        console.error('Error al recargar historial:', error);
      }
      
    } catch (error) {
      console.error('Error al guardar estado del día:', error);
      toast.error('Error al guardar el estado del día. Inténtalo nuevamente.');
    } finally {
      setGuardandoEstado(false);
    }
  };

  const handleFinalizarLesion = async () => {
    if (!selectedJugador) {
      toast.error('No hay jugador seleccionado');
      return;
    }

    // Mostrar confirmación
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres marcar la lesión de ${selectedJugador.jugador.nombres} ${selectedJugador.jugador.apellidos} como finalizada?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    try {
      setFinalizandoLesion(true);
      
      console.log('Finalizando lesión ID:', selectedJugador.id);
      const resultado = await finalizarLesion(selectedJugador.id);
      
      toast.success(`Lesión finalizada correctamente. ${selectedJugador.jugador.nombres} ha sido dado de alta.`);
      
      // Recargar la lista de jugadores activos para que el jugador ya no aparezca
      try {
        const jugadoresActualizados = await getJugadoresConLesionActiva();
        setJugadoresActivos(jugadoresActualizados);
        
        // Limpiar la selección actual
        setSelectedJugador(null);
        setHistorialJugador([]);
        setEstadoSeleccionadoHoy('');
        
        console.log('Lista de jugadores actualizada tras finalizar lesión');
      } catch (error) {
        console.error('Error al recargar lista de jugadores:', error);
        toast.warning('Lesión finalizada, pero hubo un error al actualizar la lista. Recarga la página.');
      }
      
    } catch (error) {
      console.error('Error al finalizar lesión:', error);
      toast.error('Error al finalizar la lesión. Inténtalo nuevamente.');
    } finally {
      setFinalizandoLesion(false);
    }
  };

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-wanderers-green">
                Estado de Lesiones de Jugadores
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Seguimiento diario del estado de recuperación de las lesiones activas
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Jugadores con lesiones activas</p>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                  <p className="text-xl sm:text-2xl font-bold text-wanderers-green">
                    {loadingJugadores ? (
                      <span className="animate-pulse">--</span>
                    ) : (
                      jugadoresActivos.length
                    )}
                  </p>
                  {!loadingJugadores && (
                    <div className={`w-2 h-2 rounded-full ${
                      jugadoresActivos.length === 0 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                  )}
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
                  Jugadores con Lesiones Activas
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona un jugador para ver el detalle de su lesión
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
                        <div className="bg-gray-200 h-24 rounded-lg"></div>
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
                    <p className="text-gray-600 text-sm mb-4">{error}</p>
                    <button
                      onClick={recargarJugadores}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-wanderers-green bg-white border border-wanderers-green rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reintentar
                    </button>
                  </div>
                ) : jugadoresActivos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-green-500 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      ¡Excelente! No hay jugadores con lesiones activas
                    </p>
                    <button
                      onClick={recargarJugadores}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Actualizar lista
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jugadoresActivos.map((jugadorLesion) => (
                      <div
                        key={jugadorLesion.id}
                        onClick={() => handleJugadorSelect(jugadorLesion)}
                        className={`
                          p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                          ${selectedJugador?.id === jugadorLesion.id
                            ? 'border-wanderers-green bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-wanderers-green'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg flex-shrink-0">
                                {getTipoLesionIcon(jugadorLesion.tipo_lesion)}
                              </span>
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {jugadorLesion.jugador.nombres} {jugadorLesion.jugador.apellidos}
                              </h3>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">División:</span> {jugadorLesion.jugador.division_nombre}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                <span className="font-medium">Región:</span> {jugadorLesion.region_cuerpo_display}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Desde:</span> {formatearFecha(jugadorLesion.fecha_lesion)}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className={`
                                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                                ${getGravedadColor(jugadorLesion.gravedad_lesion)}
                              `}>
                                {jugadorLesion.gravedad_lesion_display}
                              </span>
                              
                              {jugadorLesion.dias_recuperacion_estimados && (
                                <span className="text-xs text-gray-500 hidden sm:inline">
                                  ~{jugadorLesion.dias_recuperacion_estimados} días
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="ml-2 flex-shrink-0">
                            <svg 
                              className={`w-5 h-5 transition-colors duration-200 ${
                                selectedJugador?.id === jugadorLesion.id
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

          {/* Columna Derecha - Detalles del Jugador */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              {selectedJugador ? (
                <div className="p-6">
                  {/* Header del jugador seleccionado */}
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-wanderers-green">
                          {selectedJugador.jugador.nombres} {selectedJugador.jugador.apellidos}
                        </h2>
                        <p className="text-gray-600 mt-1">
                          {selectedJugador.jugador.division_nombre} • RUT: {selectedJugador.jugador.rut}
                        </p>
                      </div>
                      <span className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
                        ${getGravedadColor(selectedJugador.gravedad_lesion)}
                      `}>
                        {selectedJugador.gravedad_lesion_display}
                      </span>
                    </div>
                  </div>

                  {/* Información de la lesión */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Información de la Lesión</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Diagnóstico</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedJugador.diagnostico_medico}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Tipo de Lesión</label>
                          <p className="text-sm text-gray-900 mt-1">
                            {getTipoLesionIcon(selectedJugador.tipo_lesion)} {selectedJugador.tipo_lesion_display}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Región Afectada</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedJugador.region_cuerpo_display}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Cronología</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Fecha de Lesión</label>
                          <p className="text-sm text-gray-900 mt-1">{formatearFecha(selectedJugador.fecha_lesion)}</p>
                        </div>
                        
                        {selectedJugador.dias_recuperacion_estimados && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Días Estimados de Recuperación</label>
                            <p className="text-sm text-gray-900 mt-1">{selectedJugador.dias_recuperacion_estimados} días</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Estado Actual</label>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedJugador.esta_activa ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Lesión Activa
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Recuperado
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel de Estado del Día */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Estado del Día (Hoy)</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Registra el estado actual del tratamiento de {selectedJugador.jugador.nombres}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date().toLocaleDateString('es-CL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Información de la lesión resumida */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getTipoLesionIcon(selectedJugador.tipo_lesion)}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {selectedJugador.diagnostico_medico}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedJugador.region_cuerpo_display} • {selectedJugador.tipo_lesion_display}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones de Estado */}
                    <div className="space-y-4 mb-6">
                      <h4 className="font-medium text-gray-900">Selecciona el estado de tratamiento de hoy:</h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {/* Tratamiento en Camilla */}
                        <label className={`
                          relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${estadoSeleccionadoHoy === 'camilla'
                            ? 'border-red-500 bg-red-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-25'
                          }
                        `}>
                          <input
                            type="radio"
                            name="estadoTratamiento"
                            value="camilla"
                            checked={estadoSeleccionadoHoy === 'camilla'}
                            onChange={(e) => setEstadoSeleccionadoHoy(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4
                            ${estadoSeleccionadoHoy === 'camilla'
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300'
                            }
                          `}>
                            {estadoSeleccionadoHoy === 'camilla' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <div>
                              <div className="font-medium text-gray-900">Tratamiento en Camilla</div>
                              <div className="text-sm text-gray-600">Terapia manual, fisioterapia básica</div>
                            </div>
                          </div>
                        </label>

                        {/* Tratamiento en Gimnasio */}
                        <label className={`
                          relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${estadoSeleccionadoHoy === 'gimnasio'
                            ? 'border-yellow-500 bg-yellow-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-25'
                          }
                        `}>
                          <input
                            type="radio"
                            name="estadoTratamiento"
                            value="gimnasio"
                            checked={estadoSeleccionadoHoy === 'gimnasio'}
                            onChange={(e) => setEstadoSeleccionadoHoy(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4
                            ${estadoSeleccionadoHoy === 'gimnasio'
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-300'
                            }
                          `}>
                            {estadoSeleccionadoHoy === 'gimnasio' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                            <div>
                              <div className="font-medium text-gray-900">Tratamiento en Gimnasio</div>
                              <div className="text-sm text-gray-600">Ejercicios de fortalecimiento y rehabilitación</div>
                            </div>
                          </div>
                        </label>

                        {/* Reintegro Deportivo */}
                        <label className={`
                          relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                          ${estadoSeleccionadoHoy === 'reintegro'
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
                          }
                        `}>
                          <input
                            type="radio"
                            name="estadoTratamiento"
                            value="reintegro"
                            checked={estadoSeleccionadoHoy === 'reintegro'}
                            onChange={(e) => setEstadoSeleccionadoHoy(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4
                            ${estadoSeleccionadoHoy === 'reintegro'
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                            }
                          `}>
                            {estadoSeleccionadoHoy === 'reintegro' && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <div>
                              <div className="font-medium text-gray-900">Reintegro Deportivo</div>
                              <div className="text-sm text-gray-600">Listo para entrenamientos y competencia</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Botón de Guardar */}
                    <div className="flex justify-end space-x-3 mb-6">
                      <button
                        onClick={() => setEstadoSeleccionadoHoy('')}
                        disabled={!estadoSeleccionadoHoy || guardandoEstado}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Limpiar
                      </button>
                      <button
                        onClick={handleGuardarEstado}
                        disabled={!estadoSeleccionadoHoy || guardandoEstado}
                        className="bg-wanderers-green text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {guardandoEstado ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Guardar Estado de Hoy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Historial Visual */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Historial de Tratamiento
                      </h4>
                      
                      {loadingHistorial ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wanderers-green"></div>
                          <span className="ml-2 text-gray-600">Cargando historial...</span>
                        </div>
                      ) : errorHistorial ? (
                        <div className="text-center py-8">
                          <div className="text-red-500 mb-3">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">{errorHistorial}</p>
                          <button
                            onClick={recargarHistorial}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-wanderers-green bg-white border border-wanderers-green rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reintentar
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <HistorialLesionGraph 
                            historial={historialJugador}
                            diasMostrar={60}
                          />
                        </div>
                      )}

                      {/* Botón Finalizar Lesión */}
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Gestión de Lesión</h5>
                            <p className="text-xs text-gray-600 mt-1">
                              Si el jugador está completamente recuperado, puedes finalizar la lesión
                            </p>
                          </div>
                          <button
                            onClick={handleFinalizarLesion}
                            disabled={finalizandoLesion}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {finalizandoLesion ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Finalizando...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Finalizar Lesión</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <div className="text-gray-300 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecciona un jugador
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Elige un jugador de la lista para ver los detalles de su lesión y el historial de tratamiento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadoLesionPage; 