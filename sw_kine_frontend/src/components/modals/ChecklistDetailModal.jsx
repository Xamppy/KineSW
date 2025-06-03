import React from 'react';

const ChecklistDetailModal = ({ checklist, onClose }) => {
  // Si no hay checklist, no mostrar el modal
  if (!checklist) {
    return null;
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Función para formatear el momento de aparición
  const formatMomentoAparicion = (momento) => {
    const momentos = {
      'durante_partido': 'Durante el partido',
      'post_partido': 'Post-partido',
      'pre_partido': 'Pre-partido',
      'entrenamiento': 'Durante entrenamiento'
    };
    return momentos[momento] || momento || 'No especificado';
  };

  // Función para formatear el mecanismo de lesión
  const formatMecanismoLesion = (mecanismo) => {
    const mecanismos = {
      'contacto_directo': 'Contacto directo',
      'sin_contacto': 'Sin contacto',
      'sobrecarga': 'Sobrecarga',
      'fatiga': 'Fatiga',
      'otro': 'Otro'
    };
    return mecanismos[mecanismo] || mecanismo || 'No especificado';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-wanderers-green">
              Detalles del Checklist Post-Partido
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Evaluación realizada el {formatDate(checklist.fecha_registro)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            title="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-8">
          {/* Información básica del partido */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10M5 21h14" />
              </svg>
              Información del Partido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jugador</label>
                <p className="text-lg font-semibold text-gray-900">
                  {checklist.jugador?.nombres} {checklist.jugador?.apellidos}
                </p>
                <p className="text-sm text-gray-500">
                  RUT: {checklist.jugador?.rut || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  División: {checklist.jugador?.division_nombre || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Rival</label>
                <p className="text-lg font-semibold text-gray-900">{checklist.rival}</p>
                <p className="text-sm text-gray-500">
                  División: {checklist.division || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha del Partido</label>
                <p className="text-lg font-semibold text-gray-900">{formatDate(checklist.fecha_partido)}</p>
                <p className="text-sm text-gray-500">
                  {checklist.ubicacion_partido === 'Local' ? '🏠 Partido en casa' : '✈️ Partido de visita'}
                </p>
              </div>
            </div>
          </div>

          {/* Evaluación de dolor/molestia */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Evaluación de Dolor/Molestia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">¿Presenta dolor o molestia?</label>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    checklist.dolor_molestia 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {checklist.dolor_molestia ? '⚠️ Sí' : '✅ No'}
                  </span>
                </div>
              </div>
              
              {checklist.dolor_molestia && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Intensidad del dolor</label>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-red-600 mr-2">
                        {checklist.intensidad_dolor || 'N/A'}
                      </span>
                      <span className="text-gray-500">/10</span>
                      <div className="ml-4 flex space-x-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < (checklist.intensidad_dolor || 0)
                                ? 'bg-red-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Zona anatómica afectada</label>
                    <p className="text-lg text-gray-900 bg-red-50 px-3 py-2 rounded-md">
                      {checklist.ubicacion_dolor || 'No especificada'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información médica detallada */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Información Médica Detallada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mecanismo de lesión</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md">
                  {formatMecanismoLesion(checklist.mecanismo_lesion)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Momento de aparición</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md">
                  {formatMomentoAparicion(checklist.momento_aparicion)}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Diagnóstico presuntivo</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md min-h-[2.5rem]">
                  {checklist.diagnostico_presuntivo || 'No especificado'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Tratamiento inmediato aplicado</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md min-h-[2.5rem]">
                  {checklist.tratamiento_inmediato || 'No se aplicó tratamiento inmediato'}
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Observaciones
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Observaciones del jugador</label>
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {checklist.observaciones_jugador || 'Sin observaciones del jugador.'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Observaciones del kinesiólogo</label>
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {checklist.observaciones_kinesiologo || 'Sin observaciones del kinesiólogo.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del profesional */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Profesional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Realizado por</label>
                <p className="text-lg font-semibold text-gray-900">
                  {checklist.kinesiologo?.nombre || checklist.realizado_por || 'No especificado'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de registro</label>
                <p className="text-lg text-gray-900">
                  {formatDate(checklist.fecha_registro)}
                </p>
                <p className="text-sm text-gray-500">
                  {checklist.fecha_registro && new Date(checklist.fecha_registro).toLocaleTimeString('es-CL')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              // Aquí se podría implementar la funcionalidad de imprimir o descargar
              window.print();
            }}
            className="px-6 py-2 bg-wanderers-green text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetailModal; 