import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPartidoById, getConvocados, createChecklistPartido, getChecklistsPorPartido } from '../services/api';

const RealizarChecklistPage = () => {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  
  const [partido, setPartido] = useState(null);
  const [convocados, setConvocados] = useState([]);
  const [checklistsExistentes, setChecklistsExistentes] = useState([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado del formulario de checklist (manteniendo estructura original)
  const [checklistData, setChecklistData] = useState({
    dolor_molestia: false,
    intensidad_dolor: '',
    mecanismo_dolor_evaluado: 'SOBRECARGA',
    momento_aparicion_molestia: 'PRIMER_TIEMPO',
    zona_anatomica_dolor: '',
    otra_zona_anatomica: '',
    diagnostico_presuntivo_postpartido: '',
    tratamiento_inmediato_realizado: '',
    observaciones_checklist: ''
  });

  // Constantes originales para las opciones con colores
  const OPCIONES_INTENSIDAD = [
    { valor: '1', etiqueta: '1', color: 'bg-green-500' },
    { valor: '2', etiqueta: '2', color: 'bg-green-500' },
    { valor: '3', etiqueta: '3', color: 'bg-green-500' },
    { valor: '4', etiqueta: '4', color: 'bg-yellow-500' },
    { valor: '5', etiqueta: '5', color: 'bg-yellow-500' },
    { valor: '6', etiqueta: '6', color: 'bg-yellow-500' },
    { valor: '7', etiqueta: '7', color: 'bg-yellow-500' },
    { valor: '8', etiqueta: '8', color: 'bg-red-500' },
    { valor: '9', etiqueta: '9', color: 'bg-red-500' },
    { valor: '10', etiqueta: '10', color: 'bg-red-500' }
  ];

  const OPCIONES_ZONA = [
    'ISQUIOTIBIALES',
    'CUÁDRICEPS',
    'ADUCTORES',
    'GEMELOS',
    'RODILLA',
    'TOBILLO',
    'CADERA',
    'LUMBAR',
    'HOMBRO',
    'PIE',
    'OTRO'
  ];

  const OPCIONES_MECANISMO = [
    { valor: 'SOBRECARGA', etiqueta: 'Sobrecarga' },
    { valor: 'TRAUMATISMO', etiqueta: 'Traumatismo' },
    { valor: 'OTRO', etiqueta: 'Otro' }
  ];

  const OPCIONES_MOMENTO = [
    { valor: 'PRIMER_TIEMPO', etiqueta: 'Primer Tiempo' },
    { valor: 'SEGUNDO_TIEMPO', etiqueta: 'Segundo Tiempo' },
    { valor: 'CALENTAMIENTO', etiqueta: 'Calentamiento' },
    { valor: 'POST_PARTIDO', etiqueta: 'Post Partido' }
  ];

  useEffect(() => {
    cargarDatos();
  }, [partidoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del partido, convocados y checklists existentes
      const [partidoData, convocadosData, checklistsData] = await Promise.all([
        getPartidoById(partidoId),
        getConvocados(partidoId),
        getChecklistsPorPartido(partidoId)
      ]);
      
      setPartido(partidoData);
      setConvocados(convocadosData);
      setChecklistsExistentes(checklistsData);
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del partido');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarJugador = (jugador) => {
    setJugadorSeleccionado(jugador);
    
    // Buscar si ya existe un checklist para este jugador
    const checklistExistente = checklistsExistentes.find(c => c.jugador === jugador.id);
    
    if (checklistExistente) {
      // Cargar datos del checklist existente
      setChecklistData({
        dolor_molestia: checklistExistente.dolor_molestia || false,
        intensidad_dolor: checklistExistente.intensidad_dolor || '',
        mecanismo_dolor_evaluado: checklistExistente.mecanismo_dolor_evaluado || 'SOBRECARGA',
        momento_aparicion_molestia: checklistExistente.momento_aparicion_molestia || 'PRIMER_TIEMPO',
        zona_anatomica_dolor: checklistExistente.zona_anatomica_dolor || '',
        otra_zona_anatomica: checklistExistente.otra_zona_anatomica || '',
        diagnostico_presuntivo_postpartido: checklistExistente.diagnostico_presuntivo_postpartido || '',
        tratamiento_inmediato_realizado: checklistExistente.tratamiento_inmediato_realizado || '',
        observaciones_checklist: checklistExistente.observaciones_checklist || ''
      });
    } else {
      // Resetear formulario para nuevo checklist
      setChecklistData({
        dolor_molestia: false,
        intensidad_dolor: '',
        mecanismo_dolor_evaluado: 'SOBRECARGA',
        momento_aparicion_molestia: 'PRIMER_TIEMPO',
        zona_anatomica_dolor: '',
        otra_zona_anatomica: '',
        diagnostico_presuntivo_postpartido: '',
        tratamiento_inmediato_realizado: '',
        observaciones_checklist: ''
      });
    }
  };

  const handleChecklistChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChecklistData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar campos relacionados con dolor si se desmarca
    if (name === 'dolor_molestia' && !checked) {
      setChecklistData(prev => ({
        ...prev,
        intensidad_dolor: '',
        zona_anatomica_dolor: '',
        otra_zona_anatomica: '',
        mecanismo_dolor_evaluado: 'SOBRECARGA',
        diagnostico_presuntivo_postpartido: '',
        momento_aparicion_molestia: 'PRIMER_TIEMPO',
        tratamiento_inmediato_realizado: ''
      }));
    }

    // Limpiar campo "otra zona" si se cambia de "OTRO" a otra opción
    if (name === 'zona_anatomica_dolor' && value !== 'OTRO') {
      setChecklistData(prev => ({
        ...prev,
        otra_zona_anatomica: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jugadorSeleccionado) {
      alert('Por favor selecciona un jugador');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        jugador: jugadorSeleccionado.id,
        partido: parseInt(partidoId),
        dolor_molestia: checklistData.dolor_molestia
      };

      if (checklistData.dolor_molestia) {
        payload.intensidad_dolor = checklistData.intensidad_dolor;
        // Si seleccionó "OTRO", usar el valor del campo de texto, sino usar la zona seleccionada
        payload.zona_anatomica_dolor = checklistData.zona_anatomica_dolor === 'OTRO' 
          ? checklistData.otra_zona_anatomica 
          : checklistData.zona_anatomica_dolor;
        payload.diagnostico_presuntivo_postpartido = checklistData.diagnostico_presuntivo_postpartido || null;
        payload.momento_aparicion_molestia = checklistData.momento_aparicion_molestia || null;
        payload.tratamiento_inmediato_realizado = checklistData.tratamiento_inmediato_realizado || null;
      }

      payload.mecanismo_dolor_evaluado = checklistData.dolor_molestia ? checklistData.mecanismo_dolor_evaluado : null;
      payload.observaciones_checklist = checklistData.observaciones_checklist || null;
      
      await createChecklistPartido(payload);
      
      alert('Checklist guardado exitosamente');
      
      // Recargar checklists existentes
      const checklistsActualizados = await getChecklistsPorPartido(partidoId);
      setChecklistsExistentes(checklistsActualizados);
      
      // Limpiar selección
      setJugadorSeleccionado(null);
      
    } catch (err) {
      console.error('Error al guardar checklist:', err);
      alert('Error al guardar el checklist. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const tieneChecklist = (jugadorId) => {
    return checklistsExistentes.some(c => c.jugador === jugadorId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-wanderers-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del partido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error al cargar los datos</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => navigate('/partidos')}
                  className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Volver a Partidos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/partidos')}
            className="text-wanderers-green hover:underline mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Partidos
          </button>
          
          {partido && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h1 className="text-2xl font-bold text-wanderers-green mb-2">
                Checklists Post-Partido
              </h1>
              <h2 className="text-lg font-semibold text-gray-900">
                vs {partido.rival}
              </h2>
              <p className="text-gray-600">
                {partido.fecha_str || new Date(partido.fecha).toLocaleDateString('es-CL')} - {partido.condicion_display}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {checklistsExistentes.length} de {convocados.length} checklists completados
              </p>
            </div>
          )}
        </div>

        {/* Jugadores Convocados en cuadros pequeños */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Jugadores Convocados ({convocados.length})
          </h3>
          
          {convocados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay jugadores convocados para este partido
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {convocados.map((jugador) => {
                const checklistCompleto = tieneChecklist(jugador.id);
                const isSelected = jugadorSeleccionado?.id === jugador.id;
                
                return (
                  <div
                    key={jugador.id}
                    className={`
                      relative p-3 border rounded-lg cursor-pointer transition-all duration-200 text-center
                      ${isSelected 
                        ? 'border-wanderers-green bg-green-50 ring-2 ring-wanderers-green' 
                        : checklistCompleto
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => seleccionarJugador(jugador)}
                  >
                    {jugador.foto_perfil_url && (
                      <img
                        src={jugador.foto_perfil_url}
                        alt={`${jugador.nombres} ${jugador.apellidos}`}
                        className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                      />
                    )}
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {jugador.nombres} {jugador.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      #{jugador.numero_ficha}
                    </p>
                    
                    {checklistCompleto && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario de Checklist (diseño original) */}
        {!jugadorSeleccionado ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg">Selecciona un jugador para completar su checklist</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {/* Encabezado */}
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-2xl font-bold text-wanderers-green">
                  Checklist Post-Partido - {jugadorSeleccionado.nombres} {jugadorSeleccionado.apellidos}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete la información sobre el estado del jugador después del partido
                </p>
              </div>

              {/* Contenido del formulario */}
              <div className="px-4 py-5 sm:p-6">
                {/* Información del jugador seleccionado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="block text-gray-500">RUT</span>
                    <span className="font-medium">{jugadorSeleccionado.rut}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="block text-gray-500">División</span>
                    <span className="font-medium">{jugadorSeleccionado.division_nombre}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <span className="block text-gray-500">Número de Ficha</span>
                    <span className="font-medium">#{jugadorSeleccionado.numero_ficha}</span>
                  </div>
                </div>

                {/* Sección: Evaluación del Dolor */}
                <section>
                  <h3 className="text-lg font-semibold text-wanderers-green mb-4">
                    Evaluación del Dolor
                  </h3>
                  <div className="space-y-6">
                    {/* Radio buttons de dolor/molestia */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        ¿Sintió Dolor o Molestia?
                      </label>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="dolor_molestia_si"
                            name="dolor_molestia"
                            checked={checklistData.dolor_molestia === true}
                            onChange={() => setChecklistData(prev => ({
                              ...prev,
                              dolor_molestia: true
                            }))}
                            className="focus:ring-wanderers-green h-4 w-4 text-wanderers-green border-gray-300"
                          />
                          <label htmlFor="dolor_molestia_si" className="ml-3 block text-sm font-medium text-gray-700">
                            Sí
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="dolor_molestia_no"
                            name="dolor_molestia"
                            checked={checklistData.dolor_molestia === false}
                            onChange={() => setChecklistData(prev => ({
                              ...prev,
                                                           dolor_molestia: false,
                             intensidad_dolor: '',
                             zona_anatomica_dolor: '',
                             otra_zona_anatomica: '',
                             mecanismo_dolor_evaluado: 'SOBRECARGA',
                             diagnostico_presuntivo_postpartido: '',
                             momento_aparicion_molestia: 'PRIMER_TIEMPO',
                             tratamiento_inmediato_realizado: ''
                            }))}
                            className="focus:ring-wanderers-green h-4 w-4 text-wanderers-green border-gray-300"
                          />
                          <label htmlFor="dolor_molestia_no" className="ml-3 block text-sm font-medium text-gray-700">
                            No
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Campos condicionales si hay dolor */}
                    {checklistData.dolor_molestia && (
                      <div className="space-y-6">
                        {/* Intensidad del Dolor */}
                        <div>
                          <label className="block text-sm font-medium text-wanderers-green mb-3">
                            Intensidad del Dolor *
                          </label>
                          <div className="space-y-2">
                            {/* Barra de semáforo */}
                            <div className="flex h-2 mb-4">
                              <div className="flex-1 bg-green-500 rounded-l"></div>
                              <div className="flex-1 bg-yellow-500"></div>
                              <div className="flex-1 bg-red-500 rounded-r"></div>
                            </div>
                            <div className="text-xs flex justify-between mb-4">
                              <span className="text-green-700">Leve (1-3)</span>
                              <span className="text-yellow-700">Moderado (4-7)</span>
                              <span className="text-red-700">Severo (8-10)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                              {OPCIONES_INTENSIDAD.map(({ valor, etiqueta, color }) => (
                                <div
                                  key={valor}
                                  className={`
                                    relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200
                                    ${checklistData.intensidad_dolor === valor 
                                      ? `${color} border-gray-800 text-white` 
                                      : 'border-gray-200 hover:border-gray-400'}
                                  `}
                                  onClick={() => setChecklistData(prev => ({
                                    ...prev,
                                    intensidad_dolor: valor
                                  }))}
                                >
                                  <input
                                    type="radio"
                                    name="intensidad_dolor"
                                    value={valor}
                                    checked={checklistData.intensidad_dolor === valor}
                                    onChange={() => {}}
                                    className="sr-only"
                                    required
                                  />
                                  <span className={`text-lg font-bold ${checklistData.intensidad_dolor === valor ? 'text-white' : 'text-gray-700'}`}>
                                    {etiqueta}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                                                 {/* Zona Anatómica */}
                         <div>
                           <label htmlFor="zona_anatomica_dolor" className="block text-sm font-medium text-wanderers-green mb-3">
                             Zona Anatómica *
                           </label>
                           <select
                             id="zona_anatomica_dolor"
                             name="zona_anatomica_dolor"
                             value={checklistData.zona_anatomica_dolor}
                             onChange={handleChecklistChange}
                             className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-wanderers-green focus:border-wanderers-green rounded-md"
                             required
                           >
                             <option value="">Seleccione una zona</option>
                             {OPCIONES_ZONA.map((zona) => (
                               <option key={zona} value={zona}>
                                 {zona}
                               </option>
                             ))}
                           </select>

                           {/* Campo de texto condicional para "OTRO" */}
                           {checklistData.zona_anatomica_dolor === 'OTRO' && (
                             <div className="mt-3">
                               <label htmlFor="otra_zona_anatomica" className="block text-sm font-medium text-gray-700 mb-1">
                                 Especifique la zona anatómica *
                               </label>
                               <input
                                 type="text"
                                 id="otra_zona_anatomica"
                                 name="otra_zona_anatomica"
                                 value={checklistData.otra_zona_anatomica}
                                 onChange={handleChecklistChange}
                                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers-green focus:border-wanderers-green"
                                 placeholder="Ej: Clavícula, Costilla, etc."
                                 required
                               />
                             </div>
                           )}
                         </div>

                        {/* Momento de Aparición */}
                        <div>
                          <label className="block text-sm font-medium text-wanderers-green mb-3">
                            Momento de Aparición *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            {OPCIONES_MOMENTO.map(({ valor, etiqueta }) => (
                              <div
                                key={valor}
                                className={`
                                  relative flex items-center justify-center p-4 border rounded-lg cursor-pointer
                                  ${checklistData.momento_aparicion_molestia === valor 
                                    ? 'border-wanderers-green bg-wanderers-green text-white' 
                                    : 'border-gray-200 hover:border-wanderers-green hover:bg-gray-50'}
                                `}
                                onClick={() => setChecklistData(prev => ({
                                  ...prev,
                                  momento_aparicion_molestia: valor
                                }))}
                              >
                                <input
                                  type="radio"
                                  name="momento_aparicion_molestia"
                                  value={valor}
                                  checked={checklistData.momento_aparicion_molestia === valor}
                                  onChange={() => {}}
                                  className="sr-only"
                                  required
                                />
                                <span className={`text-sm font-medium ${checklistData.momento_aparicion_molestia === valor ? 'text-white' : 'text-gray-700'}`}>
                                  {etiqueta}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Diagnóstico Presuntivo */}
                        <div>
                          <label htmlFor="diagnostico_presuntivo_postpartido" className="block text-sm font-medium text-wanderers-green mb-1">
                            Diagnóstico Presuntivo
                          </label>
                          <textarea
                            id="diagnostico_presuntivo_postpartido"
                            name="diagnostico_presuntivo_postpartido"
                            value={checklistData.diagnostico_presuntivo_postpartido}
                            onChange={handleChecklistChange}
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers-green focus:border-wanderers-green"
                            placeholder="Describa el diagnóstico presuntivo..."
                          />
                        </div>

                        {/* Tratamiento Inmediato */}
                        <div>
                          <label htmlFor="tratamiento_inmediato_realizado" className="block text-sm font-medium text-wanderers-green mb-1">
                            Tratamiento Inmediato Realizado
                          </label>
                          <textarea
                            id="tratamiento_inmediato_realizado"
                            name="tratamiento_inmediato_realizado"
                            value={checklistData.tratamiento_inmediato_realizado}
                            onChange={handleChecklistChange}
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers-green focus:border-wanderers-green"
                            placeholder="Describa el tratamiento realizado..."
                          />
                        </div>

                        {/* Mecanismo del Dolor/Lesión */}
                        <div className="border-t border-gray-200 pt-6">
                          <label className="block text-sm font-medium text-wanderers-green mb-3">
                            Posible mecanismo de lesión (Opcional)
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {OPCIONES_MECANISMO.map(({ valor, etiqueta }) => (
                              <div
                                key={valor}
                                className={`
                                  relative flex items-center justify-center p-4 border rounded-lg cursor-pointer
                                  ${checklistData.mecanismo_dolor_evaluado === valor 
                                    ? 'border-wanderers-green bg-wanderers-green text-white' 
                                    : 'border-gray-200 hover:border-wanderers-green hover:bg-gray-50'}
                                `}
                                onClick={() => setChecklistData(prev => ({
                                  ...prev,
                                  mecanismo_dolor_evaluado: valor
                                }))}
                              >
                                <input
                                  type="radio"
                                  name="mecanismo_dolor_evaluado"
                                  value={valor}
                                  checked={checklistData.mecanismo_dolor_evaluado === valor}
                                  onChange={() => {}}
                                  className="sr-only"
                                />
                                <span className={`text-sm font-medium ${checklistData.mecanismo_dolor_evaluado === valor ? 'text-white' : 'text-gray-700'}`}>
                                  {etiqueta}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Observaciones Generales */}
                    <div className="border-t border-gray-200 pt-6">
                      <label htmlFor="observaciones_checklist" className="block text-sm font-medium text-wanderers-green mb-1">
                        Observaciones Generales
                      </label>
                      <textarea
                        id="observaciones_checklist"
                        name="observaciones_checklist"
                        value={checklistData.observaciones_checklist}
                        onChange={handleChecklistChange}
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers-green focus:border-wanderers-green"
                        placeholder="Agregue cualquier observación adicional..."
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Pie del formulario */}
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-gray-50">
                <button
                  type="button"
                  onClick={() => setJugadorSeleccionado(null)}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                  disabled={saving}
                >
                  Cancelar
                </button>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-wanderers-green text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center font-medium"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar Checklist
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealizarChecklistPage; 