import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJugadores, addChecklist } from '../services/api';
import { toast } from 'react-toastify';

const AddChecklistPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el selector de jugador
  const [jugadores, setJugadores] = useState([]);
  const [selectedJugadorId, setSelectedJugadorId] = useState('');
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el formulario del checklist
  const [checklistData, setChecklistData] = useState({
    jugador: '',
    fecha_partido_evaluado: new Date().toISOString().split('T')[0],
    rival: '',
    dolor_molestia: false,
    intensidad_dolor: '',
    zona_anatomica_dolor: '',
    mecanismo_dolor_evaluado: 'SOBRECARGA',
    diagnostico_presuntivo_postpartido: '',
    momento_aparicion_molestia: 'PRIMER_TIEMPO',
    tratamiento_inmediato_realizado: '',
    observaciones_checklist: ''
  });

  // Constantes para las opciones
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
    const fetchJugadores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getJugadores();
        
        if (!Array.isArray(data)) {
          throw new Error('Formato de datos inválido');
        }

        const jugadoresActivos = data.filter(jugador => jugador.activo);
        
        if (jugadoresActivos.length === 0) {
          toast.warning('No hay jugadores activos disponibles');
        }

        setJugadores(jugadoresActivos);
      } catch (err) {
        console.error('Error al cargar jugadores:', err);
        setError('Error al cargar la lista de jugadores');
        toast.error('Error al cargar la lista de jugadores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJugadores();
  }, []);

  useEffect(() => {
    if (selectedJugadorId) {
      const jugador = jugadores.find(j => j.id === parseInt(selectedJugadorId));
      setSelectedJugador(jugador);
      setChecklistData(prev => ({
        ...prev,
        jugador: selectedJugadorId
      }));
    } else {
      setSelectedJugador(null);
      setChecklistData(prev => ({
        ...prev,
        jugador: ''
      }));
    }
  }, [selectedJugadorId, jugadores]);

  const handleJugadorChange = (e) => {
    setSelectedJugadorId(e.target.value);
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
        mecanismo_dolor_evaluado: 'SOBRECARGA',
        diagnostico_presuntivo_postpartido: '',
        momento_aparicion_molestia: 'PRIMER_TIEMPO',
        tratamiento_inmediato_realizado: ''
      }));
    }
  };

  const validateForm = () => {
    if (!selectedJugadorId) {
      toast.error('Por favor, seleccione un jugador');
      return false;
    }

    if (!checklistData.fecha_partido_evaluado) {
      toast.error('Por favor, ingrese la fecha del partido');
      return false;
    }

    if (checklistData.dolor_molestia) {
      if (!checklistData.intensidad_dolor) {
        toast.error('Por favor, indique la intensidad del dolor');
        return false;
      }
      if (!checklistData.zona_anatomica_dolor) {
        toast.error('Por favor, indique la zona anatómica del dolor');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        jugador: selectedJugadorId,
        fecha_partido_evaluado: checklistData.fecha_partido_evaluado,
        rival: checklistData.rival || null,
        dolor_molestia: checklistData.dolor_molestia
      };

      if (checklistData.dolor_molestia) {
        payload.intensidad_dolor = checklistData.intensidad_dolor;
        payload.zona_anatomica_dolor = checklistData.zona_anatomica_dolor;
        payload.diagnostico_presuntivo_postpartido = checklistData.diagnostico_presuntivo_postpartido || null;
        payload.momento_aparicion_molestia = checklistData.momento_aparicion_molestia || null;
        payload.tratamiento_inmediato_realizado = checklistData.tratamiento_inmediato_realizado || null;
      }

      payload.mecanismo_dolor_evaluado = checklistData.dolor_molestia ? checklistData.mecanismo_dolor_evaluado : null;
      payload.observaciones_checklist = checklistData.observaciones_checklist || null;

      await addChecklist(payload);
      toast.success('Checklist guardado exitosamente');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error al guardar el checklist:', error);
      toast.error(error.message || 'Error al guardar el checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-wanderers mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando jugadores...</p>
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
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Reintentar
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Encabezado */}
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-wanderers">Nuevo Checklist Post-Partido</h2>
              <p className="mt-1 text-sm text-gray-500">
                Complete la información sobre el estado del jugador después del partido
              </p>
            </div>

            {/* Contenido del formulario */}
            <div className="px-4 py-5 sm:p-6">
              {/* Sección 1: Información básica */}
              <section>
                <h3 className="text-lg font-semibold text-wanderers mb-4">
                  Información Básica
                </h3>
                <div className="space-y-6">
                  {/* Selector de jugador */}
                  <div>
                    <label htmlFor="jugador" className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar Jugador *
                    </label>
                    <div className="relative">
                      <select
                        id="jugador"
                        value={selectedJugadorId}
                        onChange={handleJugadorChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-wanderers focus:border-wanderers rounded-md"
                        required
                      >
                        <option value="">Seleccione un jugador</option>
                        {jugadores.map((jugador) => (
                          <option key={jugador.id} value={jugador.id}>
                            {jugador.nombres} {jugador.apellidos} - {jugador.rut}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedJugador && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <span className="block text-gray-500">RUT</span>
                        <span className="font-medium">{selectedJugador.rut}</span>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <span className="block text-gray-500">División</span>
                        <span className="font-medium">{selectedJugador.division}</span>
                      </div>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <span className="block text-gray-500">Posición</span>
                        <span className="font-medium">{selectedJugador.posicion}</span>
                      </div>
                    </div>
                  )}

                  {/* Fecha y Rival */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fecha_partido_evaluado" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha del Partido *
                      </label>
                      <input
                        type="date"
                        id="fecha_partido_evaluado"
                        name="fecha_partido_evaluado"
                        value={checklistData.fecha_partido_evaluado}
                        onChange={handleChecklistChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="rival" className="block text-sm font-medium text-gray-700 mb-1">
                        Rival (Opcional)
                      </label>
                      <input
                        type="text"
                        id="rival"
                        name="rival"
                        value={checklistData.rival}
                        onChange={handleChecklistChange}
                        placeholder="Ej: Colo-Colo"
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección 2: Evaluación del Dolor */}
              <section className="border-t border-gray-200 pt-8 mt-8">
                <h3 className="text-lg font-semibold text-wanderers mb-4">
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
                          className="focus:ring-wanderers h-4 w-4 text-wanderers border-gray-300"
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
                            mecanismo_dolor_evaluado: 'SOBRECARGA',
                            diagnostico_presuntivo_postpartido: '',
                            momento_aparicion_molestia: 'PRIMER_TIEMPO',
                            tratamiento_inmediato_realizado: ''
                          }))}
                          className="focus:ring-wanderers h-4 w-4 text-wanderers border-gray-300"
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
                        <label className="block text-sm font-medium text-wanderers mb-3">
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
                        <label htmlFor="zona_anatomica_dolor" className="block text-sm font-medium text-wanderers mb-3">
                          Zona Anatómica *
                        </label>
                        <select
                          id="zona_anatomica_dolor"
                          name="zona_anatomica_dolor"
                          value={checklistData.zona_anatomica_dolor}
                          onChange={handleChecklistChange}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-wanderers focus:border-wanderers rounded-md"
                          required
                        >
                          <option value="">Seleccione una zona</option>
                          {OPCIONES_ZONA.map((zona) => (
                            <option key={zona} value={zona}>
                              {zona}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Momento de Aparición */}
                      <div>
                        <label className="block text-sm font-medium text-wanderers mb-3">
                          Momento de Aparición *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          {OPCIONES_MOMENTO.map(({ valor, etiqueta }) => (
                            <div
                              key={valor}
                              className={`
                                relative flex items-center justify-center p-4 border rounded-lg cursor-pointer
                                ${checklistData.momento_aparicion_molestia === valor 
                                  ? 'border-wanderers bg-wanderers text-white' 
                                  : 'border-gray-200 hover:border-wanderers hover:bg-gray-50'}
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
                        <label htmlFor="diagnostico_presuntivo_postpartido" className="block text-sm font-medium text-wanderers mb-1">
                          Diagnóstico Presuntivo
                        </label>
                        <textarea
                          id="diagnostico_presuntivo_postpartido"
                          name="diagnostico_presuntivo_postpartido"
                          value={checklistData.diagnostico_presuntivo_postpartido}
                          onChange={handleChecklistChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                          placeholder="Describa el diagnóstico presuntivo..."
                        />
                      </div>

                      {/* Tratamiento Inmediato */}
                      <div>
                        <label htmlFor="tratamiento_inmediato_realizado" className="block text-sm font-medium text-wanderers mb-1">
                          Tratamiento Inmediato Realizado
                        </label>
                        <textarea
                          id="tratamiento_inmediato_realizado"
                          name="tratamiento_inmediato_realizado"
                          value={checklistData.tratamiento_inmediato_realizado}
                          onChange={handleChecklistChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                          placeholder="Describa el tratamiento realizado..."
                        />
                      </div>

                      {/* Mecanismo del Dolor/Lesión */}
                      <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-medium text-wanderers mb-3">
                          Posible mecanismo de lesión (Opcional)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {OPCIONES_MECANISMO.map(({ valor, etiqueta }) => (
                            <div
                              key={valor}
                              className={`
                                relative flex items-center justify-center p-4 border rounded-lg cursor-pointer
                                ${checklistData.mecanismo_dolor_evaluado === valor 
                                  ? 'border-wanderers bg-wanderers text-white' 
                                  : 'border-gray-200 hover:border-wanderers hover:bg-gray-50'}
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
                    <label htmlFor="observaciones_checklist" className="block text-sm font-medium text-wanderers mb-1">
                      Observaciones Generales
                    </label>
                    <textarea
                      id="observaciones_checklist"
                      name="observaciones_checklist"
                      value={checklistData.observaciones_checklist}
                      onChange={handleChecklistChange}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                      placeholder="Agregue cualquier observación adicional..."
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Pie del formulario */}
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-gray-50">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-wanderers hover:bg-wanderers/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers'}
                `}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Checklist'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChecklistPage; 