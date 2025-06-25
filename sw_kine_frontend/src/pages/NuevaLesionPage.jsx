import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJugadores, createLesion } from '../services/api';

const NuevaLesionPage = () => {
  const navigate = useNavigate();
  
  // Opciones predefinidas (deben coincidir con el backend)
  const opcionesTipoLesion = [
    { value: 'muscular', label: 'Muscular' },
    { value: 'ligamentosa', label: 'Ligamentosa' },
    { value: 'osea', label: 'Ósea' },
    { value: 'tendinosa', label: 'Tendinosa' },
    { value: 'articular', label: 'Articular' },
    { value: 'meniscal', label: 'Meniscal' },
    { value: 'contusion', label: 'Contusión' },
    { value: 'otra', label: 'Otra' }
  ];

  const opcionesRegionCuerpo = [
    // Miembro inferior
    { value: 'tobillo_izq', label: 'Tobillo Izquierdo' },
    { value: 'tobillo_der', label: 'Tobillo Derecho' },
    { value: 'rodilla_izq', label: 'Rodilla Izquierda' },
    { value: 'rodilla_der', label: 'Rodilla Derecha' },
    { value: 'cadera_izq', label: 'Cadera Izquierda' },
    { value: 'cadera_der', label: 'Cadera Derecha' },
    { value: 'muslo_ant_izq', label: 'Muslo Anterior Izquierdo' },
    { value: 'muslo_ant_der', label: 'Muslo Anterior Derecho' },
    { value: 'muslo_post_izq', label: 'Muslo Posterior Izquierdo' },
    { value: 'muslo_post_der', label: 'Muslo Posterior Derecho' },
    { value: 'pantorrilla_izq', label: 'Pantorrilla Izquierda' },
    { value: 'pantorrilla_der', label: 'Pantorrilla Derecha' },
    { value: 'pie_izq', label: 'Pie Izquierdo' },
    { value: 'pie_der', label: 'Pie Derecho' },
    // Miembro superior
    { value: 'hombro_izq', label: 'Hombro Izquierdo' },
    { value: 'hombro_der', label: 'Hombro Derecho' },
    { value: 'codo_izq', label: 'Codo Izquierdo' },
    { value: 'codo_der', label: 'Codo Derecho' },
    { value: 'muneca_izq', label: 'Muñeca Izquierda' },
    { value: 'muneca_der', label: 'Muñeca Derecha' },
    { value: 'mano_izq', label: 'Mano Izquierda' },
    { value: 'mano_der', label: 'Mano Derecha' },
    // Tronco
    { value: 'columna_cervical', label: 'Columna Cervical' },
    { value: 'columna_dorsal', label: 'Columna Dorsal' },
    { value: 'columna_lumbar', label: 'Columna Lumbar' },
    { value: 'abdomen', label: 'Abdomen' },
    { value: 'pelvis', label: 'Pelvis' },
    // Cabeza
    { value: 'cabeza', label: 'Cabeza' },
    { value: 'facial', label: 'Región Facial' },
    // Otro
    { value: 'otra', label: 'Otra Región' }
  ];

  const opcionesMecanismoLesional = [
    { value: 'contacto', label: 'Por contacto' },
    { value: 'sin_contacto', label: 'Sin contacto' },
    { value: 'sobrecarga', label: 'Sobrecarga' },
    { value: 'traumatico', label: 'Traumático' },
    { value: 'indirecto', label: 'Mecanismo indirecto' },
    { value: 'otro', label: 'Otro mecanismo' }
  ];

  const opcionesCondicionLesion = [
    { value: 'aguda', label: 'Aguda' },
    { value: 'cronica', label: 'Crónica' },
    { value: 'recidivante', label: 'Recidivante' },
    { value: 'sobreaguda', label: 'Sobreaguda' }
  ];

  const opcionesEtapaDeportiva = [
    { value: 'pretemporada', label: 'Pretemporada' },
    { value: 'competencia', label: 'Competencia' },
    { value: 'posttemporada', label: 'Posttemporada' },
    { value: 'entrenamiento', label: 'Entrenamiento' },
    { value: 'partido', label: 'Partido oficial' },
    { value: 'amistoso', label: 'Partido amistoso' }
  ];

  const opcionesGravedad = [
    { value: 'leve', label: 'Leve (1-7 días)' },
    { value: 'moderada', label: 'Moderada (8-28 días)' },
    { value: 'grave', label: 'Grave (> 28 días)' },
    { value: 'severa', label: 'Severa (requiere cirugía)' }
  ];

  // Función para obtener colores de gravedad (igual que en EstadoLesionPage)
  const getGravedadColor = (gravedad) => {
    switch (gravedad) {
      case 'leve':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'menor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderada':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'grave':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'severa':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    jugador: '',
    fecha_lesion: '',
    diagnostico_medico: '',
    tipo_lesion: '',
    region_cuerpo: '',
    mecanismo_lesional: '',
    condicion_lesion: '',
    etapa_deportiva_lesion: '',
    gravedad_lesion: '',
    dias_recuperacion_estimados: ''
  });

  // Estado para lista de jugadores
  const [listaJugadores, setListaJugadores] = useState([]);
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar jugadores al montar el componente
  useEffect(() => {
    const cargarJugadores = async () => {
      try {
        setLoadingJugadores(true);
        const jugadores = await getJugadores({ activo: true });
        setListaJugadores(jugadores);
      } catch (error) {
        console.error('Error al cargar jugadores:', error);
        setErrors({ general: 'Error al cargar la lista de jugadores' });
      } finally {
        setLoadingJugadores(false);
      }
    };

    cargarJugadores();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.jugador) {
      newErrors.jugador = 'Debe seleccionar un jugador';
    }
    if (!formData.fecha_lesion) {
      newErrors.fecha_lesion = 'La fecha de lesión es requerida';
    }
    if (!formData.diagnostico_medico.trim()) {
      newErrors.diagnostico_medico = 'El diagnóstico médico es requerido';
    }
    if (!formData.tipo_lesion) {
      newErrors.tipo_lesion = 'Debe seleccionar el tipo de lesión';
    }
    if (!formData.region_cuerpo) {
      newErrors.region_cuerpo = 'Debe seleccionar la región del cuerpo';
    }
    if (!formData.mecanismo_lesional) {
      newErrors.mecanismo_lesional = 'Debe seleccionar el mecanismo lesional';
    }
    if (!formData.condicion_lesion) {
      newErrors.condicion_lesion = 'Debe seleccionar la condición de la lesión';
    }
    if (!formData.etapa_deportiva_lesion) {
      newErrors.etapa_deportiva_lesion = 'Debe seleccionar la etapa deportiva';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('FormData original:', formData);
      
      // Preparar datos para envío
      const lesionData = {
        ...formData,
        jugador: parseInt(formData.jugador),
        dias_recuperacion_estimados: formData.dias_recuperacion_estimados ? parseInt(formData.dias_recuperacion_estimados) : null
      };

      console.log('Datos preparados para API:', lesionData);
      console.log('Validación de campos:');
      console.log('- jugador (número):', lesionData.jugador, typeof lesionData.jugador);
      console.log('- fecha_lesion:', lesionData.fecha_lesion, typeof lesionData.fecha_lesion);
      console.log('- diagnostico_medico:', lesionData.diagnostico_medico, typeof lesionData.diagnostico_medico);
      console.log('- tipo_lesion:', lesionData.tipo_lesion, typeof lesionData.tipo_lesion);
      console.log('- region_cuerpo:', lesionData.region_cuerpo, typeof lesionData.region_cuerpo);
      console.log('- gravedad_lesion:', lesionData.gravedad_lesion, typeof lesionData.gravedad_lesion);
      console.log('- dias_recuperacion_estimados:', lesionData.dias_recuperacion_estimados, typeof lesionData.dias_recuperacion_estimados);

      // Enviar datos a la API
      const nuevaLesion = await createLesion(lesionData);
      console.log('Lesión creada exitosamente:', nuevaLesion);
      
      // Redirigir a la página de lesiones después del éxito
      navigate('/lesiones', { 
        state: { 
          message: 'Lesión registrada exitosamente',
          type: 'success' 
        }
      });
    } catch (error) {
      console.error('Error al registrar lesión:', error);
      setErrors({ 
        general: error.message || 'Error al registrar la lesión. Por favor, intente nuevamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Link
                  to="/lesiones"
                  className="text-gray-400 hover:text-wanderers-green transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-wanderers-green">
                    Registrar Nueva Lesión
                  </h1>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                    Completa los detalles de la lesión del jugador
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-wanderers-green">
              Información de la Lesión
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Proporciona los detalles necesarios para el registro de la lesión
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Error general */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                {/* Selector de Jugador */}
                <div>
                  <label htmlFor="jugador" className="block text-sm font-medium text-gray-700 mb-2">
                    Jugador *
                  </label>
                  {loadingJugadores ? (
                    <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md bg-gray-50">
                      <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-gray-500">Cargando jugadores...</span>
                    </div>
                  ) : (
                    <select
                      id="jugador"
                      name="jugador"
                      value={formData.jugador}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                        errors.jugador ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar jugador...</option>
                      {listaJugadores.map(jugador => (
                        <option key={jugador.id} value={jugador.id}>
                          {jugador.nombres} {jugador.apellidos} - {jugador.division_nombre}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.jugador && (
                    <p className="mt-1 text-sm text-red-600">{errors.jugador}</p>
                  )}
                </div>

                {/* Fecha de Lesión */}
                <div>
                  <label htmlFor="fecha_lesion" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Lesión *
                  </label>
                  <input
                    type="date"
                    id="fecha_lesion"
                    name="fecha_lesion"
                    value={formData.fecha_lesion}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.fecha_lesion ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.fecha_lesion && (
                    <p className="mt-1 text-sm text-red-600">{errors.fecha_lesion}</p>
                  )}
                </div>

                {/* Diagnóstico Médico */}
                <div>
                  <label htmlFor="diagnostico_medico" className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico Médico *
                  </label>
                  <textarea
                    id="diagnostico_medico"
                    name="diagnostico_medico"
                    value={formData.diagnostico_medico}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Describe el diagnóstico médico de la lesión..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.diagnostico_medico ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.diagnostico_medico && (
                    <p className="mt-1 text-sm text-red-600">{errors.diagnostico_medico}</p>
                  )}
                </div>

                {/* Tipo de Lesión */}
                <div>
                  <label htmlFor="tipo_lesion" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Lesión *
                  </label>
                  <select
                    id="tipo_lesion"
                    name="tipo_lesion"
                    value={formData.tipo_lesion}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.tipo_lesion ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar tipo de lesión...</option>
                    {opcionesTipoLesion.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_lesion && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo_lesion}</p>
                  )}
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                {/* Región del Cuerpo */}
                <div>
                  <label htmlFor="region_cuerpo" className="block text-sm font-medium text-gray-700 mb-2">
                    Región del Cuerpo *
                  </label>
                  <select
                    id="region_cuerpo"
                    name="region_cuerpo"
                    value={formData.region_cuerpo}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.region_cuerpo ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar región del cuerpo...</option>
                    {opcionesRegionCuerpo.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  {errors.region_cuerpo && (
                    <p className="mt-1 text-sm text-red-600">{errors.region_cuerpo}</p>
                  )}
                </div>

                {/* Mecanismo Lesional */}
                <div>
                  <label htmlFor="mecanismo_lesional" className="block text-sm font-medium text-gray-700 mb-2">
                    Mecanismo Lesional *
                  </label>
                  <select
                    id="mecanismo_lesional"
                    name="mecanismo_lesional"
                    value={formData.mecanismo_lesional}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.mecanismo_lesional ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar mecanismo lesional...</option>
                    {opcionesMecanismoLesional.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  {errors.mecanismo_lesional && (
                    <p className="mt-1 text-sm text-red-600">{errors.mecanismo_lesional}</p>
                  )}
                </div>

                {/* Condición de Lesión */}
                <div>
                  <label htmlFor="condicion_lesion" className="block text-sm font-medium text-gray-700 mb-2">
                    Condición de Lesión *
                  </label>
                  <select
                    id="condicion_lesion"
                    name="condicion_lesion"
                    value={formData.condicion_lesion}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.condicion_lesion ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar condición de lesión...</option>
                    {opcionesCondicionLesion.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  {errors.condicion_lesion && (
                    <p className="mt-1 text-sm text-red-600">{errors.condicion_lesion}</p>
                  )}
                </div>

                {/* Etapa Deportiva */}
                <div>
                  <label htmlFor="etapa_deportiva_lesion" className="block text-sm font-medium text-gray-700 mb-2">
                    Etapa Deportiva *
                  </label>
                  <select
                    id="etapa_deportiva_lesion"
                    name="etapa_deportiva_lesion"
                    value={formData.etapa_deportiva_lesion}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      errors.etapa_deportiva_lesion ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar etapa deportiva...</option>
                    {opcionesEtapaDeportiva.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  {errors.etapa_deportiva_lesion && (
                    <p className="mt-1 text-sm text-red-600">{errors.etapa_deportiva_lesion}</p>
                  )}
                </div>

                {/* Gravedad de Lesión */}
                <div>
                  <label htmlFor="gravedad_lesion" className="block text-sm font-medium text-gray-700 mb-2">
                    Gravedad de Lesión
                  </label>
                  <select
                    id="gravedad_lesion"
                    name="gravedad_lesion"
                    value={formData.gravedad_lesion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                  >
                    <option value="">Seleccionar gravedad...</option>
                    {opcionesGravedad.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  
                  {/* Preview de la gravedad seleccionada */}
                  {formData.gravedad_lesion && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGravedadColor(formData.gravedad_lesion)}`}>
                        {opcionesGravedad.find(op => op.value === formData.gravedad_lesion)?.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Días de Recuperación Estimados */}
                <div>
                  <label htmlFor="dias_recuperacion_estimados" className="block text-sm font-medium text-gray-700 mb-2">
                    Días de Recuperación Estimados
                  </label>
                  <input
                    type="number"
                    id="dias_recuperacion_estimados"
                    name="dias_recuperacion_estimados"
                    value={formData.dias_recuperacion_estimados}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Ej: 14"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Número estimado de días para la recuperación completa
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
              <Link
                to="/lesiones"
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || loadingJugadores}
                className="bg-wanderers-green text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-wanderers-green-dark transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
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
                    <span>Guardar Lesión</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevaLesionPage; 