import axios from 'axios';
import axiosInstance from './axiosConfig';

// Crear una instancia de Axios con configuración base
const api = axiosInstance;

// Interceptor para manejar tokens JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sw_kine_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token de autenticación incluido en la solicitud');
    } else {
      console.warn('No se encontró token de autenticación');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Error 401: No autenticado');
      localStorage.removeItem('sw_kine_access_token');
      
      const currentPath = window.location.pathname;
      console.log(`Recibido error 401 en la ruta: ${currentPath}`);
      
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Verifica el estado actual de la autenticación
 * @returns {Object} - Información sobre el estado de autenticación
 */
export const checkAuthStatus = () => {
  const token = localStorage.getItem('sw_kine_access_token');
  
  return {
    isAuthenticated: !!token,
    token: token ? `${token.substring(0, 15)}...` : null,
    authMode: 'production'
  };
};

// ===== FUNCIONES PARA DIVISIONES =====

/**
 * Obtiene la lista de divisiones
 * @returns {Promise} - Promesa con la respuesta
 */
export const getDivisiones = async () => {
  try {
    console.log('Realizando petición a /divisiones/');
    const response = await api.get('/divisiones/');
    console.log('Respuesta del servidor:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    } else if (response.data && typeof response.data === 'object') {
      const divisiones = Object.values(response.data).filter(item => 
        item && typeof item === 'object' && 'id' in item && 'nombre' in item
      );
      if (divisiones.length > 0) {
        return divisiones;
      }
    }
    
    console.warn('Formato de respuesta no reconocido, retornando array vacío');
    return [];
  } catch (error) {
    console.error('Error al obtener divisiones:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtiene una división específica por su ID
 * @param {number} divisionId - ID de la división
 * @returns {Promise} - Promesa con la respuesta
 */
export const getDivisionById = async (divisionId) => {
  try {
    const response = await api.get(`/divisiones/${divisionId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la división ${divisionId}:`, error);
    throw error.response?.data || error;
  }
};

// ===== FUNCIONES PARA JUGADORES =====

/**
 * Obtiene la lista de jugadores
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise} - Promesa con la respuesta
 */
export const getJugadores = async (params = {}) => {
  try {
    console.log('getJugadores llamado con params:', params);
    const response = await api.get('/jugadores/', { params });
    console.log('Respuesta de la API:', response);
    
    const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
    console.log('Datos procesados:', data);
    return data;
  } catch (error) {
    console.error('Error en getJugadores:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene los detalles de un jugador específico
 * @param {number} jugadorId - ID del jugador
 * @returns {Promise} - Promesa con la respuesta
 */
export const getJugadorById = async (jugadorId) => {
  try {
    const response = await api.get(`/jugadores/${jugadorId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener jugador ${jugadorId}:`, error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Crea un nuevo jugador
 * @param {Object} datosJugador - Datos del jugador a crear
 * @returns {Promise} - Promesa con la respuesta
 */
export const addJugador = async (datosJugador) => {
  try {
    let response;
    
    if (datosJugador instanceof FormData) {
      console.log('Enviando datos con FormData (multipart/form-data)');
      response = await api.post('/jugadores/', datosJugador, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      console.log('Enviando datos como JSON');
      response = await api.post('/jugadores/', datosJugador);
    }

    return response.data;
  } catch (error) {
    console.error('Error al crear jugador:', error);
    throw error.response?.data || error;
  }
};

/**
 * Sube una foto de perfil para un jugador
 * @param {number} jugadorId - ID del jugador
 * @param {FormData} formData - Datos del archivo
 * @returns {Promise} - Promesa con la respuesta
 */
export const uploadFotoJugador = async (jugadorId, formData) => {
  try {
    const response = await api.post(`/jugadores/${jugadorId}/upload_foto/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir foto del jugador:', error);
    throw error.response?.data || error;
  }
};

// ===== FUNCIONES PARA ATENCIONES KINÉSICAS =====

/**
 * Obtiene las atenciones kinésicas de un jugador
 * @param {number} jugadorId - ID del jugador
 * @returns {Promise} - Promesa con la respuesta
 */
export const getAtencionesPorJugador = async (jugadorId) => {
  try {
    console.log(`Obteniendo atenciones para jugador ${jugadorId}`);
    const response = await api.get(`/atenciones/?jugador=${jugadorId}`);
    console.log('Respuesta de atenciones:', response.data);
    
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error) {
    console.error('Error al obtener atenciones del jugador:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Crea una nueva atención kinésica
 * @param {Object} datosAtencion - Datos de la atención
 * @returns {Promise} - Promesa con la respuesta
 */
export const addAtencionKinesica = async (datosAtencion) => {
  try {
    console.log('Creando nueva atención kinésica:', datosAtencion);
    console.log('Datos enviados al backend:', JSON.stringify(datosAtencion, null, 2));
    const response = await api.post('/atenciones/', datosAtencion);
    console.log('Atención kinésica creada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear atención kinésica:', error);
    console.error('Detalles del error:', error.response?.data);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// ===== FUNCIONES PARA LESIONES =====

/**
 * Obtiene jugadores que tienen lesiones activas
 * @returns {Promise} - Promesa con la respuesta
 */
export const getJugadoresConLesionActiva = async () => {
  try {
    console.log('getJugadoresConLesionActiva llamado');
    const response = await api.get('/lesiones/activas/');
    console.log('Respuesta de lesiones activas:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error en getJugadoresConLesionActiva:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene todas las lesiones de un jugador
 * @param {number} jugadorId - ID del jugador
 * @returns {Promise} - Promesa con la respuesta
 */
export const getAllLesionesPorJugador = async (jugadorId) => {
  try {
    console.log(`Obteniendo todas las lesiones para jugador ${jugadorId}`);
    const response = await api.get(`/jugadores/${jugadorId}/lesiones/`);
    console.log('Respuesta de lesiones del jugador:', response.data);
    
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error) {
    console.error('Error al obtener lesiones del jugador:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene el historial diario de una lesión
 * @param {number} lesionId - ID de la lesión
 * @returns {Promise} - Promesa con la respuesta
 */
export const getHistorialDiarioLesion = async (lesionId) => {
  try {
    console.log(`Obteniendo historial diario para lesión ${lesionId}`);
    const response = await api.get(`/lesiones/${lesionId}/historial-diario/`);
    console.log('Respuesta del historial diario:', response.data);
    
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error) {
    console.error('Error al obtener historial diario de la lesión:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Crea una nueva lesión
 * @param {Object} lesionData - Datos de la lesión
 * @returns {Promise} - Promesa con la respuesta
 */
export const createLesion = async (lesionData) => {
  try {
    console.log('Creando nueva lesión:', lesionData);
    const response = await api.post('/lesiones/', lesionData);
    console.log('Lesión creada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear lesión:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Añade un estado diario para una lesión
 * @param {number} lesionId - ID de la lesión
 * @param {string} estado - Estado del día
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise} - Promesa con la respuesta
 */
export const addEstadoDiario = async (lesionId, estado, fecha, observaciones = '') => {
  try {
    console.log(`addEstadoDiario - Lesión: ${lesionId}, Estado: ${estado}, Fecha: ${fecha}`);
    
    const estadoData = {
      lesion: lesionId,
      estado: estado,
      fecha: fecha,
      observaciones: observaciones
    };
    
    console.log('Realizando petición a /estados-diarios/');
    const response = await api.post('/estados-diarios/', estadoData);
    console.log('Respuesta de creación de estado diario:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al crear estado diario:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Finaliza una lesión
 * @param {number} lesionId - ID de la lesión
 * @returns {Promise} - Promesa con la respuesta
 */
export const finalizarLesion = async (lesionId) => {
  try {
    console.log(`Finalizando lesión ${lesionId}`);
    const response = await api.post(`/lesiones/${lesionId}/finalizar/`);
    console.log('Lesión finalizada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al finalizar lesión:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene las opciones posibles de estados de lesión
 * @returns {Promise} - Promesa con las opciones de estado
 */
export const getPosiblesEstadosLesion = async () => {
  try {
    console.log('getPosiblesEstadosLesion llamado');
    const response = await api.get('/estados-lesion-opciones/');
    console.log('Respuesta de opciones de estado:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener opciones de estado de lesión:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    // En caso de error, devolver opciones por defecto como fallback
    console.warn('Error en la petición, usando opciones por defecto como fallback');
    return [
      { value: 'camilla', label: 'Tratamiento en Camilla' },
      { value: 'gimnasio', label: 'Tratamiento en Gimnasio' },
      { value: 'reintegro', label: 'Reintegro Deportivo' }
    ];
  }
};

// ===== FUNCIONES PARA PARTIDOS =====

/**
 * Obtiene la lista de partidos
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise} - Promesa con la respuesta
 */
export const getPartidos = async (params = {}) => {
  try {
    console.log('getPartidos llamado con params:', params);
    const response = await api.get('/partidos/', { params });
    console.log('Respuesta de partidos:', response.data);
    
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene un partido específico por ID
 * @param {number} partidoId - ID del partido
 * @returns {Promise} - Promesa con la respuesta
 */
export const getPartidoById = async (partidoId) => {
  try {
    console.log(`getPartidoById llamado con ID: ${partidoId}`);
    const response = await api.get(`/partidos/${partidoId}/`);
    console.log('Respuesta del partido:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener partido por ID:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Crea un nuevo partido
 * @param {Object} partidoData - Datos del partido
 * @returns {Promise} - Promesa con la respuesta
 */
export const createPartido = async (partidoData) => {
  try {
    console.log('Creando nuevo partido:', partidoData);
    const response = await api.post('/partidos/', partidoData);
    console.log('Partido creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear partido:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Actualiza la convocatoria de un partido
 * @param {number} partidoId - ID del partido
 * @param {Array} jugadoresIds - Array de IDs de jugadores convocados
 * @returns {Promise} - Promesa con la respuesta
 */
export const updateConvocatoria = async (partidoId, jugadoresIds) => {
  try {
    console.log(`Actualizando convocatoria del partido ${partidoId}:`, jugadoresIds);
    const response = await api.patch(`/partidos/${partidoId}/`, {
      convocados: jugadoresIds
    });
    console.log('Convocatoria actualizada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar convocatoria:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene los jugadores convocados para un partido
 * @param {number} partidoId - ID del partido
 * @returns {Promise} - Promesa con la respuesta
 */
export const getConvocados = async (partidoId) => {
  try {
    console.log(`getConvocados llamado para partido ${partidoId}`);
    const response = await api.get(`/partidos/${partidoId}/convocados/`);
    console.log('Respuesta de convocados:', response.data);
    
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error) {
    console.error('Error al obtener convocados:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// ===== FUNCIONES PARA CHECKLISTS =====

/**
 * Obtiene el historial de checklists
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise} - Promesa con la respuesta
 */
export const getHistorialChecklists = async (params = {}) => {
  try {
    console.log('getHistorialChecklists llamado con params:', params);
    const response = await api.get('/checklists/', { params });
    console.log('Respuesta del historial de checklists:', response.data);
    
    return Array.isArray(response.data) ? response.data : (response.data.results || []);
  } catch (error) {
    console.error('Error al obtener historial de checklists:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Crea un nuevo checklist post-partido
 * @param {Object} checklistData - Datos del checklist
 * @returns {Promise} - Promesa con la respuesta
 */
export const createChecklistPartido = async (checklistData) => {
  try {
    console.log('Creando checklist post-partido:', checklistData);
    const response = await api.post('/checklists/', checklistData);
    console.log('Checklist creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear checklist:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

/**
 * Obtiene los checklists de un partido específico
 * @param {number} partidoId - ID del partido
 * @returns {Promise} - Promesa con la respuesta
 */
export const getChecklistsPorPartido = async (partidoId) => {
  try {
    console.log(`getChecklistsPorPartido llamado para partido ${partidoId}`);
    const response = await api.get('/checklists/por_partido/', { 
      params: { partido_id: partidoId } 
    });
    console.log('Respuesta de checklists del partido:', response.data);
    
    return response.data.checklists || [];
  } catch (error) {
    console.error('Error al obtener checklists del partido:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// ===== FUNCIONES PARA INFORMES =====

/**
 * Obtiene datos para generar informes de lesiones
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {Promise} - Promesa con la respuesta
 */
export const getDatosInformeLesiones = async (startDate, endDate) => {
  try {
    console.log(`getDatosInformeLesiones llamado con fechas: ${startDate} - ${endDate}`);
    const response = await api.get('/informes/lesiones/', {
      params: { start_date: startDate, end_date: endDate }
    });
    console.log('Respuesta de datos de informe:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de informe de lesiones:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// ===== FUNCIONES PARA ARCHIVOS MÉDICOS =====

/**
 * Crea un nuevo archivo médico
 * @param {FormData} formData - Datos del archivo
 * @returns {Promise} - Promesa con la respuesta
 */
export const createArchivoMedico = async (formData) => {
  try {
    console.log('Creando nuevo archivo médico');
    const response = await api.post('/archivos-medicos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Archivo médico creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear archivo médico:', error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// Función legacy - mantener por compatibilidad
export const addChecklist = createChecklistPartido;

// Mantener función setDevModeNoAuth para evitar errores en componentes existentes
export const setDevModeNoAuth = (enable) => {
  console.warn('setDevModeNoAuth: Función legacy - modo desarrollo deshabilitado en producción');
};

export default api; 