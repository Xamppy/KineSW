import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPartidos, createPartido } from '../services/api';

const PartidosListPage = () => {
  const [partidos, setPartidos] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mostrarDatosPrueba, setMostrarDatosPrueba] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '',
    rival: '',
    condicion: 'local'
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Lista de equipos que se consideran datos de prueba
  const EQUIPOS_PRUEBA = [
    'Universidad de Chile',
    'Colo-Colo', 
    'Universidad Católica'
  ];

  // Función para identificar si un partido es de prueba
  const esPartidoDePrueba = (partido) => {
    return EQUIPOS_PRUEBA.includes(partido.rival);
  };

  useEffect(() => {
    cargarPartidos();
  }, []);

  useEffect(() => {
    filtrarPartidos();
  }, [partidos, mostrarDatosPrueba]);

  const cargarPartidos = async () => {
    try {
      setLoading(true);
      const data = await getPartidos();
      setPartidos(data);
    } catch (err) {
      console.error('Error al cargar partidos:', err);
      setError('Error al cargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPartidos = () => {
    if (mostrarDatosPrueba) {
      setPartidosFiltrados(partidos);
    } else {
      const partidosReales = partidos.filter(partido => !esPartidoDePrueba(partido));
      setPartidosFiltrados(partidosReales);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.rival) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setCreating(true);
      const nuevoPartido = await createPartido(formData);
      
      setShowModal(false);
      setFormData({ fecha: '', rival: '', condicion: 'local' });
      
      // Recargar la lista de partidos
      await cargarPartidos();
      
      // Redirigir a la página de gestión de convocatoria
      navigate(`/partidos/${nuevoPartido.id}/convocatoria`);
    } catch (err) {
      console.error('Error al crear partido:', err);
      alert('Error al crear el partido. Por favor intente nuevamente.');
    } finally {
      setCreating(false);
    }
  };

  const getEstadoPartido = (partido) => {
    const tieneConvocados = partido.convocados && partido.convocados.length > 0;
    const fechaPartido = new Date(partido.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaPartido.setHours(0, 0, 0, 0);
    
    if (fechaPartido < hoy) {
      return { estado: 'pasado', texto: 'Partido Finalizado', color: 'bg-gray-100 text-gray-600' };
    } else if (tieneConvocados) {
      return { estado: 'listo', texto: 'Listo para Checklists', color: 'bg-green-100 text-green-700' };
    } else {
      return { estado: 'pendiente', texto: 'Convocatoria Pendiente', color: 'bg-yellow-100 text-yellow-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wanderers-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  const partidosDePrueba = partidos.filter(partido => esPartidoDePrueba(partido));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-wanderers-green">
          Gestión de Partidos y Checklists
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-wanderers-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Nuevo Partido
        </button>
      </div>

      {/* Toggle para mostrar/ocultar datos de prueba */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Datos de Prueba
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {partidosDePrueba.length > 0 ? (
                `Se encontraron ${partidosDePrueba.length} partidos de prueba (${partidosDePrueba.map(p => p.rival).join(', ')})`
              ) : (
                'No se encontraron datos de prueba'
              )}
            </p>
          </div>
          {partidosDePrueba.length > 0 && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarDatosPrueba}
                onChange={(e) => setMostrarDatosPrueba(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mostrarDatosPrueba ? 'bg-wanderers-green' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mostrarDatosPrueba ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm text-yellow-800">
                {mostrarDatosPrueba ? 'Ocultar' : 'Mostrar'} datos de prueba
              </span>
            </label>
          )}
        </div>
      </div>

      {partidosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {partidos.length === 0 ? 'No hay partidos registrados' : 'No hay partidos reales registrados'}
          </p>
          <p className="text-gray-400">
            {partidos.length === 0 ? 'Crea tu primer partido para comenzar' : 'Los datos de prueba están ocultos. Usa el toggle de arriba para mostrarlos o crea un partido real.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {partidosFiltrados.map((partido) => {
            const estadoInfo = getEstadoPartido(partido);
            const esPrueba = esPartidoDePrueba(partido);
            
            return (
              <div key={partido.id} className={`bg-white rounded-lg shadow-lg border p-6 ${
                esPrueba ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        vs {partido.rival}
                      </h3>
                      {esPrueba && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">
                          PRUEBA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4V5m6 0v6m-6 6v-6m6 6v-6m-6 0h6" />
                        </svg>
                        {partido.fecha_str || new Date(partido.fecha).toLocaleDateString('es-CL')}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {partido.condicion_display}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {partido.convocados?.length || 0}/22 convocados
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                    {estadoInfo.texto}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <Link
                    to={`/partidos/${partido.id}/convocatoria`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Gestionar Convocatoria
                  </Link>

                  {estadoInfo.estado === 'listo' && (
                    <Link
                      to={`/partidos/${partido.id}/checklist`}
                      className="bg-wanderers-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Realizar Checklists
                    </Link>
                  )}

                  {estadoInfo.estado === 'pasado' && (
                    <Link
                      to={`/partidos/${partido.id}/checklist`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Ver Checklists
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para crear nuevo partido */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Partido</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={creating}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Partido *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wanderers-green"
                  required
                  disabled={creating}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rival *
                </label>
                <input
                  type="text"
                  name="rival"
                  value={formData.rival}
                  onChange={handleInputChange}
                  placeholder="Ej: Universidad de Chile"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wanderers-green"
                  required
                  disabled={creating}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condición
                </label>
                <select
                  name="condicion"
                  value={formData.condicion}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wanderers-green"
                  disabled={creating}
                >
                  <option value="local">Local</option>
                  <option value="visitante">Visitante</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-wanderers-green text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    'Crear Partido'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartidosListPage; 