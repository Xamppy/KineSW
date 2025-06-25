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
 * Obtiene la fecha actual en formato datetime-local considerando zona horaria local
 * @returns {string} Fecha actual en formato YYYY-MM-DDThh:mm
 */
export const getCurrentDateTime = () => {
  const ahora = new Date();
  // Ajustar por zona horaria local
  const fechaLocal = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000));
  return fechaLocal.toISOString().slice(0, 16);
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD considerando zona horaria local
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDate = () => {
  const ahora = new Date();
  // Ajustar por zona horaria local
  const fechaLocal = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000));
  return fechaLocal.toISOString().split('T')[0];
};

/**
 * Convierte una fecha a formato datetime-local para inputs HTML considerando zona horaria
 * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD
 * @returns {string} Fecha en formato YYYY-MM-DDThh:mm
 */
export const formatDateForInputWithTimezone = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Ajustar por zona horaria local
    const fechaLocal = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return fechaLocal.toISOString().slice(0, 16);
  } catch (error) {
    console.error('Error al formatear fecha para input:', error);
    return dateString;
  }
}; 