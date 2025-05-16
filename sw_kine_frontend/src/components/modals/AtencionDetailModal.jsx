import React from 'react';

const AtencionDetailModal = ({ show, onClose, atencion }) => {
  if (!show || !atencion) return null;

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const renderField = (label, value, isMultiline = false) => {
    if (!value) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </h4>
        {isMultiline ? (
          <p className="text-gray-900 whitespace-pre-wrap">
            {value}
          </p>
        ) : (
          <p className="text-gray-900">
            {value}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Encabezado */}
        <div className="bg-wanderers px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Detalles de la Atención
              </h3>
              <p className="text-white/90 text-sm mt-1">
                {formatDate(atencion.fecha_atencion)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Información Principal */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {renderField('Fecha de Atención', formatDate(atencion.fecha_atencion))}
                </div>
                <div>
                  {renderField('Estado Actual', atencion.estado_actual)}
                </div>
              </div>
            </div>

            {/* Motivo de Consulta */}
            {renderField('Motivo de Consulta', atencion.motivo_consulta, true)}

            {/* Prestaciones Realizadas */}
            {renderField('Prestaciones Realizadas', atencion.prestaciones_realizadas, true)}

            {/* Observaciones */}
            {renderField('Observaciones', atencion.observaciones, true)}

            {/* Profesional a Cargo */}
            {atencion.profesional_a_cargo_info && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                {renderField('Profesional a Cargo', atencion.profesional_a_cargo_info.nombre)}
              </div>
            )}
          </div>

          {/* Botón de Cerrar */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtencionDetailModal; 