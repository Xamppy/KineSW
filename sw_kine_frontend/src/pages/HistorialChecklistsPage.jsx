import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistorialChecklists } from '../services/api';
import ChecklistDetailModal from '../components/modals/ChecklistDetailModal';

const HistorialChecklistsPage = () => {
  const [checklists, setChecklists] = useState([]);
  const [filteredChecklists, setFilteredChecklists] = useState([]);
  const [partidosConChecklists, setPartidosConChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [error, setError] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // Cargar checklists desde la API
  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando historial de checklists...');
      const data = await getHistorialChecklists();
      console.log('Checklists cargados:', data);
      
      setChecklists(data);
      setFilteredChecklists(data);
    } catch (err) {
      console.error('Error al cargar checklists:', err);
      setError('Error al cargar el historial de checklists. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar manualmente los datos
  const handleRefresh = () => {
    fetchChecklists();
  };

  // Función para filtrar checklists
  useEffect(() => {
    let filtered = checklists;

    if (searchTerm) {
      filtered = filtered.filter(checklist => {
        const jugadorNombre = `${checklist.jugador?.nombres || ''} ${checklist.jugador?.apellidos || ''}`.toLowerCase();
        const kinesiologo = checklist.kinesiologo?.nombre?.toLowerCase() || '';
        const rival = checklist.rival?.toLowerCase() || '';
        const observaciones = checklist.observaciones_kinesiologo?.toLowerCase() || '';
        
        return jugadorNombre.includes(searchTerm.toLowerCase()) ||
               kinesiologo.includes(searchTerm.toLowerCase()) ||
               rival.includes(searchTerm.toLowerCase()) ||
               observaciones.includes(searchTerm.toLowerCase());
      });
    }

    if (dateFilter) {
      filtered = filtered.filter(checklist => checklist.fecha_partido === dateFilter);
    }

    if (divisionFilter) {
      filtered = filtered.filter(checklist => checklist.division === divisionFilter);
    }

    setFilteredChecklists(filtered);
  }, [searchTerm, dateFilter, divisionFilter, checklists]);

  // Función para agrupar checklists por partido
  useEffect(() => {
    const agrupados = {};
    
    filteredChecklists.forEach(checklist => {
      // Crear clave única para el partido (fecha + rival)
      const fechaPartido = checklist.fecha_partido;
      const rival = checklist.rival || 'Sin rival especificado';
      const partidoId = `${fechaPartido}_${rival}`;
      
      // Inicializar partido si no existe
      if (!agrupados[partidoId]) {
        agrupados[partidoId] = {
          idPartido: partidoId,
          fechaPartido: fechaPartido,
          rival: rival,
          logoRival: '/src/assets/images/generic-team-logo.png',
          jugadoresConChecklist: []
        };
      }
      
      // Agregar jugador con su checklist al partido
      const jugadorNombre = `${checklist.jugador?.nombres || ''} ${checklist.jugador?.apellidos || ''}`.trim();
      agrupados[partidoId].jugadoresConChecklist.push({
        jugadorId: checklist.jugador?.id,
        nombreJugador: jugadorNombre,
        checklistData: checklist
      });
    });
    
    // Convertir el objeto en array y ordenar por fecha (más recientes primero)
    const partidosArray = Object.values(agrupados).sort((a, b) => 
      new Date(b.fechaPartido) - new Date(a.fechaPartido)
    );
    
    // Ordenar jugadores dentro de cada partido por nombre
    partidosArray.forEach(partido => {
      partido.jugadoresConChecklist.sort((a, b) => 
        a.nombreJugador.localeCompare(b.nombreJugador)
      );
    });
    
    console.log('Partidos agrupados:', partidosArray);
    setPartidosConChecklists(partidosArray);
  }, [filteredChecklists]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setDivisionFilter('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-wanderers-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error de carga</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-wanderers-green text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-wanderers-green">
                Historial Checklists Post-Partido
              </h1>
              <p className="text-gray-600 mt-2">
                Registro completo de evaluaciones por partido jugado
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                title="Actualizar datos"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </button>
              <Link
                to="/checklist-post-partido/nuevo"
                className="bg-wanderers-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nuevo Checklist</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Jugador, rival, kinesiólogo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green"
              />
            </div>

            {/* Filtro por fecha */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green"
              />
            </div>

            {/* Filtro por división */}
            <div>
              <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                División
              </label>
              <select
                id="division"
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green"
              >
                <option value="">Todas las divisiones</option>
                <option value="Primera División">Primera División</option>
                <option value="Segunda División">Segunda División</option>
                <option value="Juveniles">Juveniles</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Contenido principal - Partidos con checklists */}
        <div className="space-y-6">
          {partidosConChecklists.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay checklists</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron checklists con los filtros aplicados.
              </p>
              <Link
                to="/checklist-post-partido/nuevo"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-wanderers-green hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear primer checklist
              </Link>
            </div>
          ) : (
            partidosConChecklists.map((partido) => (
              <div key={partido.idPartido} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Encabezado del partido */}
                <div className="bg-wanderers-green text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {new Date(partido.fechaPartido).toLocaleDateString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h2>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className="text-white/90 font-medium">Wanderers</span>
                          <span className="text-white/70">vs</span>
                          <div className="flex items-center space-x-2">
                            <img 
                              src={partido.logoRival}
                              alt="Logo Rival" 
                              className="w-6 h-6 bg-white rounded-full" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="text-white/90 font-medium">{partido.rival}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 rounded-lg px-4 py-2">
                        <div className="text-sm text-white/70">Jugadores evaluados</div>
                        <div className="text-2xl font-bold text-white">
                          {partido.jugadoresConChecklist.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de jugadores participantes */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Jugadores Participantes y sus Checklists
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {partido.jugadoresConChecklist.map((jugadorChecklist, index) => (
                      <div 
                        key={`${jugadorChecklist.jugadorId}-${index}`}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-wanderers-green"
                        onClick={() => setSelectedChecklist(jugadorChecklist.checklistData)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {jugadorChecklist.nombreJugador}
                            </h4>
                            
                            <div className="space-y-1 text-sm">
                              {/* Estado del dolor */}
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Dolor/Molestia:</span>
                                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                                  jugadorChecklist.checklistData.dolor_molestia 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {jugadorChecklist.checklistData.dolor_molestia ? 'Sí' : 'No'}
                                </span>
                              </div>
                              
                              {/* Intensidad si hay dolor */}
                              {jugadorChecklist.checklistData.dolor_molestia && jugadorChecklist.checklistData.intensidad_dolor && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Intensidad:</span>
                                  <span className="text-red-600 font-medium">
                                    {jugadorChecklist.checklistData.intensidad_dolor}/10
                                  </span>
                                </div>
                              )}
                              
                              {/* Ubicación del dolor si aplica */}
                              {jugadorChecklist.checklistData.dolor_molestia && jugadorChecklist.checklistData.ubicacion_dolor && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Ubicación:</span>
                                  <span className="text-red-600 text-xs">
                                    {jugadorChecklist.checklistData.ubicacion_dolor}
                                  </span>
                                </div>
                              )}
                              
                              {/* Kinesiólogo */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-gray-600">Evaluado por:</span>
                                <span className="text-gray-800 text-xs">
                                  {jugadorChecklist.checklistData.kinesiologo?.nombre || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Indicador de click */}
                          <div className="ml-4 flex-shrink-0">
                            <div className="bg-wanderers-green/10 hover:bg-wanderers-green/20 rounded-full p-2 transition-colors">
                              <svg className="w-5 h-5 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botón de acción */}
                        <div className="mt-3 text-center">
                          <span className="text-xs text-wanderers-green font-medium">
                            Click para ver detalles completos →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de detalles del checklist seleccionado */}
        {selectedChecklist && (
          <ChecklistDetailModal
            checklist={selectedChecklist}
            onClose={() => setSelectedChecklist(null)}
          />
        )}

        {/* Estadísticas resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Partidos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {partidosConChecklists.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Evaluaciones
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {checklists.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Con Molestias
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {checklists.filter(c => c.dolor_molestia).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialChecklistsPage; 