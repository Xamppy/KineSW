import React from 'react';

const AddAtencionModal = ({
  isOpen,
  onClose,
  onSubmit,
  jugadorNombre,
  newAtencionData,
  setNewAtencionData,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const handleNewAtencionChange = (e) => {
    const { name, value } = e.target;
    setNewAtencionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Estados predefinidos para el select
  const ESTADOS_ATENCION = [
    'En evaluación',
    'En tratamiento',
    'En recuperación',
    'Alta médica',
    'Derivado a especialista',
    'Óptimo para competencia',
    'Requiere seguimiento',
    'No apto para competencia'
  ];

  // Convertir fecha a formato datetime-local
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDThh:mm
  };

  // Convertir datetime-local a formato de fecha para el backend
  const formatDateForBackend = (dateTimeString) => {
    if (!dateTimeString) return '';
    return dateTimeString.split('T')[0]; // Obtener solo la fecha YYYY-MM-DD
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Formatear la fecha antes de enviar
    const formattedData = {
      ...newAtencionData,
      fecha_atencion: formatDateForBackend(newAtencionData.fecha_atencion)
    };
    onSubmit(e, formattedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Encabezado del modal */}
        <div className="bg-wanderers px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Nueva Atención Kinésica
              </h3>
              <p className="text-white/90 text-sm mt-1">
                {jugadorNombre}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Fecha y Hora */}
            <div>
              <label 
                htmlFor="fecha_atencion" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha y Hora de Atención *
              </label>
              <input
                type="datetime-local"
                id="fecha_atencion"
                name="fecha_atencion"
                value={formatDateForInput(newAtencionData.fecha_atencion)}
                onChange={handleNewAtencionChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                required
              />
            </div>

            {/* Motivo de Consulta */}
            <div>
              <label 
                htmlFor="motivo_consulta" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motivo de Consulta *
              </label>
              <textarea
                id="motivo_consulta"
                name="motivo_consulta"
                value={newAtencionData.motivo_consulta}
                onChange={handleNewAtencionChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                placeholder="Describa el motivo de la consulta..."
                required
              />
            </div>

            {/* Prestaciones Realizadas */}
            <div>
              <label 
                htmlFor="prestaciones_realizadas" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prestaciones Realizadas *
              </label>
              <textarea
                id="prestaciones_realizadas"
                name="prestaciones_realizadas"
                value={newAtencionData.prestaciones_realizadas}
                onChange={handleNewAtencionChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                placeholder="Detalle las prestaciones realizadas..."
                required
              />
            </div>

            {/* Estado Actual */}
            <div>
              <label 
                htmlFor="estado_actual" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estado Actual *
              </label>
              <select
                id="estado_actual"
                name="estado_actual"
                value={newAtencionData.estado_actual}
                onChange={handleNewAtencionChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                required
              >
                <option value="">Seleccione un estado</option>
                {ESTADOS_ATENCION.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <label 
                htmlFor="observaciones" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={newAtencionData.observaciones}
                onChange={handleNewAtencionChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-wanderers focus:border-wanderers"
                placeholder="Agregue observaciones adicionales..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-wanderers hover:bg-wanderers/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Atención'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAtencionModal; 