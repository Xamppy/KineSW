import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getJugadores, getAtencionesPorJugador, addAtencionKinesica } from '../services/api';
import AddAtencionModal from '../components/AddAtencionModal';
import AtencionDetailModal from '../components/modals/AtencionDetailModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/dateUtils';

const AtencionesPage = () => {
  // Estados para la lista de jugadores y búsqueda
  const [jugadores, setJugadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  
  // Estados para las atenciones
  const [atencionesJugador, setAtencionesJugador] = useState([]);
  const [loadingAtenciones, setLoadingAtenciones] = useState(false);
  const [showAddAtencionModal, setShowAddAtencionModal] = useState(false);
  const [selectedAtencionDetail, setSelectedAtencionDetail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Función para obtener fecha/hora actual en formato datetime-local
  const getCurrentDateTime = () => {
    const now = new Date();
    // Ajustar a zona horaria local
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  // Estado para el formulario de nueva atención
  const [newAtencionData, setNewAtencionData] = useState({
    fecha_atencion: getCurrentDateTime(), // Formato YYYY-MM-DDThh:mm en hora local
    motivo_consulta: '',
    prestaciones_realizadas: '',
    estado_actual: '',
    observaciones: '',
    jugador: null
  });

  // Función para limpiar RUT (eliminar puntos y guión)
  const limpiarRut = (rut) => {
    return rut.replace(/\./g, '').replace(/-/g, '').toLowerCase();
  };

  useEffect(() => {
    cargarJugadores();
  }, []);

  const cargarJugadores = async () => {
    try {
      setLoadingJugadores(true);
      const data = await getJugadores();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido');
      }

      const jugadoresActivos = data.filter(jugador => jugador.activo);
      
      if (jugadoresActivos.length === 0) {
        toast.warning('No hay jugadores activos disponibles');
      }

      setJugadores(jugadoresActivos);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.error('Error al cargar la lista de jugadores. Por favor, intente nuevamente.');
    } finally {
      setLoadingJugadores(false);
    }
  };

  const handleJugadorSelect = async (jugador) => {
    setSelectedJugador(jugador);
    setNewAtencionData(prev => ({
      ...prev,
      jugador: jugador.id
    }));
    await cargarAtencionesJugador(jugador.id);
  };

  const cargarAtencionesJugador = async (jugadorId) => {
    try {
      setLoadingAtenciones(true);
      const atenciones = await getAtencionesPorJugador(jugadorId);
      setAtencionesJugador(atenciones);
    } catch (error) {
      console.error('Error al cargar atenciones:', error);
      toast.error('Error al cargar las atenciones del jugador. Por favor, intente nuevamente.');
    } finally {
      setLoadingAtenciones(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAtencionClick = (atencion) => {
    setSelectedAtencionDetail(atencion);
  };

  const handleSaveNewAtencion = async (e, formattedData) => {
    e.preventDefault();
    
    // Validar campos requeridos
    const camposRequeridos = ['fecha_atencion', 'motivo_consulta', 'prestaciones_realizadas', 'estado_actual'];
    const camposFaltantes = camposRequeridos.filter(campo => !formattedData[campo]);
    
    if (camposFaltantes.length > 0) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (!selectedJugador?.id) {
      toast.error('Error: No hay un jugador seleccionado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamar a la API para crear la atención
      const nuevaAtencion = await addAtencionKinesica({
        ...formattedData,
        jugador: selectedJugador.id
      });

      // Actualizar la lista de atenciones
      await cargarAtencionesJugador(selectedJugador.id);

      // Cerrar el modal y resetear el formulario
      setShowAddAtencionModal(false);
      setNewAtencionData({
        fecha_atencion: getCurrentDateTime(),
        motivo_consulta: '',
        prestaciones_realizadas: '',
        estado_actual: '',
        observaciones: '',
        jugador: selectedJugador.id
      });

      // Mostrar mensaje de éxito
      toast.success('Atención kinésica registrada exitosamente');
    } catch (error) {
      console.error('Error al guardar la atención:', error);
      toast.error(error.message || 'Error al registrar la atención kinésica');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewAtencionChange = (e) => {
    const { name, value } = e.target;
    setNewAtencionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredJugadores = jugadores.filter(jugador => {
    const searchLower = searchTerm.toLowerCase();
    const rutLimpio = limpiarRut(jugador.rut);
    return (
      jugador.nombres.toLowerCase().includes(searchLower) ||
      jugador.apellidos.toLowerCase().includes(searchLower) ||
      rutLimpio.includes(limpiarRut(searchLower))
    );
  });

  if (loadingJugadores) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="lg" message="Cargando jugadores..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-wanderers">Atenciones Kinésicas</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gestione las atenciones kinésicas de los jugadores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Panel de búsqueda de jugadores */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-wanderers mb-4">Jugadores</h3>
              <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers focus:border-wanderers"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredJugadores.length > 0 ? (
                  filteredJugadores.map(jugador => (
                    <button
                      key={jugador.id}
                      onClick={() => handleJugadorSelect(jugador)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedJugador?.id === jugador.id
                          ? 'bg-wanderers text-white shadow-md'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex flex-col">
                        <p className={`font-medium ${selectedJugador?.id === jugador.id ? 'text-white' : 'text-gray-900'}`}>
                          {`${jugador.nombres} ${jugador.apellidos}`}
                        </p>
                        <div className={`text-sm ${selectedJugador?.id === jugador.id ? 'text-white/90' : 'text-gray-500'}`}>
                          <p>{jugador.rut}</p>
                          <p>{jugador.division} - {jugador.posicion}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No se encontraron jugadores
                  </div>
                )}
              </div>
            </div>

            {/* Panel de atenciones */}
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {selectedJugador ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-wanderers">
                        Atenciones de {selectedJugador.nombres} {selectedJugador.apellidos}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedJugador.rut}</p>
                    </div>
                    <button
                      onClick={() => setShowAddAtencionModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-wanderers text-white rounded-md hover:bg-wanderers/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Nueva Atención
                    </button>
                  </div>
                  
                  {loadingAtenciones ? (
                    <LoadingSpinner message="Cargando atenciones..." className="py-8" />
                  ) : atencionesJugador.length > 0 ? (
                    <div className="space-y-4">
                      {atencionesJugador.map(atencion => (
                        <button
                          key={atencion.id}
                          onClick={() => handleAtencionClick(atencion)}
                          className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-wanderers focus:border-wanderers"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-wanderers">
                              {formatDate(atencion.fecha_atencion)}
                            </h4>
                            <span className="text-sm text-gray-500">
                              #{atencion.id.toString().padStart(4, '0')}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2">{atencion.motivo_consulta}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            Estado: {atencion.estado_actual}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="mt-2 text-gray-500">
                        No hay atenciones registradas para este jugador
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-500">
                    Seleccione un jugador para ver sus atenciones kinésicas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Nueva Atención */}
      <AddAtencionModal
        isOpen={showAddAtencionModal}
        onClose={() => {
          setShowAddAtencionModal(false);
          setNewAtencionData({
            fecha_atencion: getCurrentDateTime(),
            motivo_consulta: '',
            prestaciones_realizadas: '',
            estado_actual: '',
            observaciones: '',
            jugador: selectedJugador?.id
          });
        }}
        jugadorId={selectedJugador?.id}
        jugadorNombre={selectedJugador ? `${selectedJugador.nombres} ${selectedJugador.apellidos}` : ''}
        newAtencionData={newAtencionData}
        setNewAtencionData={setNewAtencionData}
        onSubmit={(e) => handleSaveNewAtencion(e, newAtencionData)}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Detalles de Atención */}
      <AtencionDetailModal
        show={selectedAtencionDetail !== null}
        onClose={() => setSelectedAtencionDetail(null)}
        atencion={selectedAtencionDetail}
      />
    </div>
  );
};

export default AtencionesPage; 