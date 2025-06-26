import React from 'react';

const ChecklistDetailModal = ({ checklist, onClose }) => {
  // Si no hay checklist, no mostrar el modal
  if (!checklist) {
    return null;
  }

  // Función para extraer solo el nombre sin el RUT
  const extractNombreSinRut = (nombreCompleto) => {
    if (!nombreCompleto) return '';
    // Remover el RUT entre paréntesis al final
    return nombreCompleto.replace(/\s*\([^)]*\)\s*$/, '').trim();
  };

  // Función de impresión mejorada
  const handlePrint = () => {
    const printContent = document.querySelector('.checklist-print-content');
    const originalContent = document.body.innerHTML;
    
    // Crear contenido para impresión
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Checklist Post-Partido - ${extractNombreSinRut(checklist.jugador_nombre)}</title>
          <style>
            @page {
              margin: 1.5cm;
              size: A4;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #1f2937;
            }
            .header {
              border-bottom: 2px solid #059669;
              padding-bottom: 1rem;
              margin-bottom: 1.5rem;
            }
            .header h1 {
              color: #059669;
              font-size: 1.5rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }
            .header p {
              color: #6b7280;
              font-size: 0.875rem;
            }
            .section {
              margin-bottom: 1.5rem;
              page-break-inside: avoid;
            }
            .section-title {
              background-color: #f3f4f6;
              padding: 0.75rem;
              border-radius: 0.5rem;
              font-weight: 600;
              margin-bottom: 1rem;
              display: flex;
              align-items: center;
            }
            .section-title svg {
              width: 1.25rem;
              height: 1.25rem;
              margin-right: 0.5rem;
            }
            .grid {
              display: grid;
              gap: 1rem;
            }
            .grid-2 {
              grid-template-columns: 1fr 1fr;
            }
            .grid-3 {
              grid-template-columns: 1fr 1fr 1fr;
            }
            .field {
              margin-bottom: 0.75rem;
            }
            .field-label {
              font-weight: 500;
              color: #4b5563;
              font-size: 0.875rem;
              margin-bottom: 0.25rem;
            }
            .field-value {
              background-color: #f9fafb;
              padding: 0.5rem;
              border-radius: 0.25rem;
              border: 1px solid #e5e7eb;
            }
            .dolor-indicator {
              display: inline-flex;
              align-items: center;
              padding: 0.25rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.875rem;
              font-weight: 500;
            }
            .dolor-si {
              background-color: #fef2f2;
              color: #dc2626;
            }
            .dolor-no {
              background-color: #f0fdf4;
              color: #16a34a;
            }
            .intensidad-container {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .intensidad-numero {
              font-size: 1.5rem;
              font-weight: bold;
              color: #dc2626;
            }
            .intensidad-dots {
              display: flex;
              gap: 0.125rem;
            }
            .dot {
              width: 0.75rem;
              height: 0.75rem;
              border-radius: 50%;
            }
            .dot-filled {
              background-color: #dc2626;
            }
            .dot-empty {
              background-color: #e5e7eb;
            }
            .observaciones {
              background-color: #faf5ff;
              padding: 0.75rem;
              border-radius: 0.25rem;
              border: 1px solid #e9d5ff;
              white-space: pre-wrap;
            }
            @media print {
              .no-break {
                page-break-inside: avoid;
              }
              .break-before {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Detalles del Checklist Post-Partido</h1>
            <p>Evaluación realizada el ${formatDate(checklist.fecha_registro_checklist || checklist.fecha_registro)}</p>
          </div>
          
          <div class="section no-break">
            <div class="section-title">📊 Información del Partido</div>
            <div class="grid grid-3">
              <div class="field">
                <div class="field-label">Jugador</div>
                <div class="field-value">
                  <strong>${extractNombreSinRut(checklist.jugador_nombre) || `${checklist.jugador_detalle?.nombres || ''} ${checklist.jugador_detalle?.apellidos || ''}`.trim()}</strong><br>
                  <small>RUT: ${checklist.jugador_detalle?.rut || checklist.jugador?.rut || 'N/A'}</small><br>
                  <small>División: ${checklist.jugador_detalle?.division_nombre || checklist.jugador?.division_nombre || 'N/A'}</small>
                </div>
              </div>
              <div class="field">
                <div class="field-label">Rival</div>
                <div class="field-value"><strong>${checklist.rival_partido || checklist.rival}</strong></div>
              </div>
              <div class="field">
                <div class="field-label">Fecha del Partido</div>
                <div class="field-value">
                  <strong>${formatDate(checklist.fecha_partido)}</strong><br>
                  <small>${checklist.partido_detalle?.condicion === 'local' ? '🏠 Partido en casa' : '✈️ Partido de visita'}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="section no-break">
            <div class="section-title">⚠️ Evaluación de Dolor/Molestia</div>
            <div class="grid grid-2">
              <div class="field">
                <div class="field-label">¿Presenta dolor o molestia?</div>
                <div class="field-value">
                  <span class="dolor-indicator ${checklist.dolor_molestia ? 'dolor-si' : 'dolor-no'}">
                    ${checklist.dolor_molestia ? '⚠️ Sí' : '✅ No'}
                  </span>
                </div>
              </div>
              ${checklist.dolor_molestia ? `
                <div class="field">
                  <div class="field-label">Intensidad del dolor</div>
                  <div class="field-value">
                    <div class="intensidad-container">
                      <span class="intensidad-numero">${checklist.intensidad_dolor || 'N/A'}</span>
                      <span>/10</span>
                      <div class="intensidad-dots">
                        ${[...Array(10)].map((_, i) => `
                          <div class="dot ${i < (checklist.intensidad_dolor || 0) ? 'dot-filled' : 'dot-empty'}"></div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="field" style="grid-column: span 2;">
                  <div class="field-label">Zona anatómica afectada</div>
                  <div class="field-value"><strong>${checklist.zona_anatomica_dolor || 'No especificada'}</strong></div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">📋 Información Médica Detallada</div>
            <div class="grid grid-2">
              <div class="field">
                <div class="field-label">Mecanismo de lesión</div>
                <div class="field-value">${formatMecanismoLesion(checklist.mecanismo_dolor_evaluado)}</div>
              </div>
              <div class="field">
                <div class="field-label">Momento de aparición</div>
                <div class="field-value">${formatMomentoAparicion(checklist.momento_aparicion_molestia)}</div>
              </div>
              <div class="field" style="grid-column: span 2;">
                <div class="field-label">Diagnóstico presuntivo</div>
                <div class="field-value">${checklist.diagnostico_presuntivo_postpartido || 'No especificado'}</div>
              </div>
              <div class="field" style="grid-column: span 2;">
                <div class="field-label">Tratamiento inmediato aplicado</div>
                <div class="field-value">${checklist.tratamiento_inmediato_realizado || 'No se aplicó tratamiento inmediato'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📝 Observaciones</div>
            <div class="field">
              <div class="field-label">Observaciones del kinesiólogo</div>
              <div class="observaciones">${checklist.observaciones_checklist || 'Sin observaciones del kinesiólogo.'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">👨‍⚕️ Información del Profesional</div>
            <div class="grid grid-2">
              <div class="field">
                <div class="field-label">Realizado por</div>
                <div class="field-value"><strong>${checklist.realizado_por_nombre || checklist.kinesiologo?.nombre || checklist.realizado_por || '1'}</strong></div>
              </div>
              <div class="field">
                <div class="field-label">Fecha de registro</div>
                <div class="field-value">
                  <strong>${formatDate(checklist.fecha_registro_checklist || checklist.fecha_registro)}</strong><br>
                  <small>${(checklist.fecha_registro_checklist || checklist.fecha_registro) && new Date(checklist.fecha_registro_checklist || checklist.fecha_registro).toLocaleTimeString('es-CL')}</small>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Abrir nueva ventana para impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Función para formatear el momento de aparición
  const formatMomentoAparicion = (momento) => {
    const momentos = {
      'PRIMER_TIEMPO': 'Primer Tiempo',
      'SEGUNDO_TIEMPO': 'Segundo Tiempo',
      'CALENTAMIENTO': 'Calentamiento',
      'POST_PARTIDO': 'Post Partido',
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
      'SOBRECARGA': 'Sobrecarga',
      'TRAUMATISMO': 'Traumatismo',
      'CONTACTO': 'Contacto',
      'GESTO_TECNICO': 'Gesto Técnico',
      'INDETERMINADO': 'Indeterminado',
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto checklist-print-content">
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
                  {extractNombreSinRut(checklist.jugador_nombre) || `${checklist.jugador_detalle?.nombres || ''} ${checklist.jugador_detalle?.apellidos || ''}`.trim()}
                </p>
                <p className="text-sm text-gray-500">
                  RUT: {checklist.jugador_detalle?.rut || checklist.jugador?.rut || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  División: {checklist.jugador_detalle?.division_nombre || checklist.jugador?.division_nombre || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Rival</label>
                <p className="text-lg font-semibold text-gray-900">{checklist.rival_partido || checklist.rival}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha del Partido</label>
                <p className="text-lg font-semibold text-gray-900">{formatDate(checklist.fecha_partido)}</p>
                <p className="text-sm text-gray-500">
                  {checklist.partido_detalle?.condicion === 'local' ? '🏠 Partido en casa' : '✈️ Partido de visita'}
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
                      {checklist.zona_anatomica_dolor || 'No especificada'}
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
                  {formatMecanismoLesion(checklist.mecanismo_dolor_evaluado)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Momento de aparición</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md">
                  {formatMomentoAparicion(checklist.momento_aparicion_molestia)}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Diagnóstico presuntivo</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md min-h-[2.5rem]">
                  {checklist.diagnostico_presuntivo_postpartido || 'No especificado'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Tratamiento inmediato aplicado</label>
                <p className="text-lg text-gray-900 bg-blue-50 px-3 py-2 rounded-md min-h-[2.5rem]">
                  {checklist.tratamiento_inmediato_realizado || 'No se aplicó tratamiento inmediato'}
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
                <label className="block text-sm font-medium text-gray-600 mb-2">Observaciones del kinesiólogo</label>
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {checklist.observaciones_checklist || 'Sin observaciones del kinesiólogo.'}
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
                  {checklist.realizado_por_nombre || checklist.kinesiologo?.nombre || checklist.realizado_por || '1'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de registro</label>
                <p className="text-lg text-gray-900">
                  {formatDate(checklist.fecha_registro_checklist || checklist.fecha_registro)}
                </p>
                <p className="text-sm text-gray-500">
                  {(checklist.fecha_registro_checklist || checklist.fecha_registro) && new Date(checklist.fecha_registro_checklist || checklist.fecha_registro).toLocaleTimeString('es-CL')}
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
            onClick={handlePrint}
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