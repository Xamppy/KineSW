/**
 * Formatea una fecha en formato legible en español
 * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
};

/**
 * Convierte una fecha a formato datetime-local para inputs HTML
 * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DDThh:mm
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Formato YYYY-MM-DDThh:mm
  } catch (error) {
    console.error('Error al formatear fecha para input:', error);
    return dateString;
  }
};

/**
 * Convierte una fecha de formato datetime-local a formato para el backend
 * @param {string} dateTimeString - Fecha en formato YYYY-MM-DDThh:mm
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForBackend = (dateTimeString) => {
  if (!dateTimeString) return '';
  return dateTimeString.split('T')[0]; // Obtener solo la fecha YYYY-MM-DD
};

/**
 * Obtiene la fecha actual en formato datetime-local
 * @returns {string} Fecha actual en formato YYYY-MM-DDThh:mm
 */
export const getCurrentDateTime = () => {
  return new Date().toISOString().slice(0, 16);
}; 