import axios from 'axios';
import axiosInstance from './axiosConfig';

// Crear una instancia de Axios con configuración base
const api = axiosInstance;

// Variable para modo de desarrollo (establecer en true para bypass temporal de autenticación)
let DEV_MODE_NO_AUTH = true; // Temporalmente activado para debugging

// Datos simulados para modo desarrollo
const MOCK_DATA = {
  jugadores: [
    {
      id: 1,
      rut: '19.345.678-9',
      nombres: 'Kevin Andrés',
      apellidos: 'Valenzuela Rosales',
      fecha_nacimiento: '1998-05-15',
      nacionalidad: 'Chilena',
      foto_perfil_url: '../assets/images/Doue.webp',
      lateralidad: 'Diestro',
      peso_kg: 75.5,
      estatura_cm: 178,
      prevision_salud: 'FONASA',
      numero_ficha: 'PE001',
      division: 1,
      division_nombre: 'Primer Equipo',
      activo: true,
      edad: 25
    },
    {
      id: 2,
      rut: '18.765.432-1',
      nombres: 'Matías Ignacio',
      apellidos: 'González Rojas',
      fecha_nacimiento: '2000-03-12',
      nacionalidad: 'Chilena',
      foto_perfil_url: '../assets/images/Guler.webp',
      lateralidad: 'Diestro',
      peso_kg: 72.0,
      estatura_cm: 175,
      prevision_salud: 'ISAPRE',
      numero_ficha: 'PE002',
      division: 1,
      division_nombre: 'Primer Equipo',
      activo: true,
      edad: 24
    },
    {
      id: 3,
      rut: '20.123.456-7',
      nombres: 'Lucas Antonio',
      apellidos: 'Pérez Mendoza',
      fecha_nacimiento: '2001-08-21',
      nacionalidad: 'Chilena',
      foto_perfil_url: '../assets/images/Hakimi.jpg',
      lateralidad: 'Zurdo',
      peso_kg: 68.5,
      estatura_cm: 170,
      prevision_salud: 'FONASA',
      numero_ficha: 'PE003',
      division: 1,
      division_nombre: 'Primer Equipo',
      activo: true,
      edad: 22
    },
    {
      id: 4,
      rut: '19.876.543-2',
      nombres: 'Diego Alejandro',
      apellidos: 'Soto Vargas',
      fecha_nacimiento: '1999-11-30',
      nacionalidad: 'Chilena',
      foto_perfil_url: '../assets/images/Yamal.jpeg',
      lateralidad: 'Diestro',
      peso_kg: 78.0,
      estatura_cm: 182,
      prevision_salud: 'ISAPRE',
      numero_ficha: 'PE004',
      division: 1,
      division_nombre: 'Primer Equipo',
      activo: true,
      edad: 24
    },
    {
      id: 5,
      rut: '20.234.567-8',
      nombres: 'Sebastián Eduardo',
      apellidos: 'Martínez Castro',
      fecha_nacimiento: '2002-04-15',
      nacionalidad: 'Chilena',
      foto_perfil_url: '../assets/images/Kvara.jpeg',
      lateralidad: 'Diestro',
      peso_kg: 70.5,
      estatura_cm: 173,
      prevision_salud: 'FONASA',
      numero_ficha: 'PE005',
      division: 1,
      division_nombre: 'Primer Equipo',
      activo: true,
      edad: 21
    }
  ],
  divisiones: [
    { id: 1, nombre: 'Primer Equipo', descripcion: 'Equipo principal masculino' },
    { id: 2, nombre: 'Femenino', descripcion: 'Equipo principal femenino' },
    { id: 3, nombre: 'Sub-21', descripcion: 'Equipo de desarrollo sub-21' }
  ],
  atenciones: [
    {
      id: 1,
      jugador: 1,
      fecha_atencion: '2024-03-15',
      motivo_consulta: 'Dolor en isquiotibiales',
      prestaciones_realizadas: 'Masaje descontracturante, ejercicios de estiramiento',
      estado_actual: 'Mejora notable, continuar con ejercicios',
      observaciones: 'Recomendar ejercicios de fortalecimiento'
    },
    {
      id: 2,
      jugador: 1,
      fecha_atencion: '2024-03-10',
      motivo_consulta: 'Control rutinario',
      prestaciones_realizadas: 'Evaluación general, ejercicios preventivos',
      estado_actual: 'Óptimo para competencia',
      observaciones: 'Mantener rutina de ejercicios'
    },
    {
      id: 3,
      jugador: 2,
      fecha_atencion: '2024-03-14',
      motivo_consulta: 'Molestia en rodilla derecha',
      prestaciones_realizadas: 'Evaluación, terapia manual, ejercicios',
      estado_actual: 'En recuperación',
      observaciones: 'Seguimiento en próxima sesión'
    }
  ]
};

// Interceptor para manejar tokens JWT
api.interceptors.request.use(
  (config) => {
    // Si estamos en modo dev sin autenticación, no intentamos añadir el token
    if (DEV_MODE_NO_AUTH) {
      console.warn('Modo desarrollo: Se omite autenticación');
      return config;
    }

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
      // Aquí podrías limpiar el token inválido
      localStorage.removeItem('sw_kine_access_token');
      
      // Para debugging - ¿estás en una página protegida?
      const currentPath = window.location.pathname;
      console.log(`Recibido error 401 en la ruta: ${currentPath}`);
      
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Activa/desactiva el modo de desarrollo sin autenticación
 * @param {boolean} enable - true para activar, false para desactivar
 */
export const setDevModeNoAuth = (enable) => {
  DEV_MODE_NO_AUTH = enable;
  console.log(`Modo desarrollo sin autenticación: ${enable ? 'ACTIVADO' : 'DESACTIVADO'}`);
};

/**
 * Verifica el estado actual de la autenticación
 * @returns {Object} - Información sobre el estado de autenticación
 */
export const checkAuthStatus = () => {
  const token = localStorage.getItem('sw_kine_access_token');
  
  return {
    isAuthenticated: !!token,
    token: token ? `${token.substring(0, 15)}...` : null, // Mostrar solo una parte por seguridad
    authMode: DEV_MODE_NO_AUTH ? 'development' : 'production'
  };
};

// Funciones específicas para interactuar con diferentes endpoints

/**
 * Obtiene la lista de divisiones (Primer Equipo, Femenino, Cadetes, etc.)
 * @returns {Promise} - Promesa con la respuesta
 */
export const getDivisiones = async () => {
  try {
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getDivisiones');
      console.log('Datos simulados:', MOCK_DATA.divisiones);
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_DATA.divisiones;
    }

    console.log('Realizando petición real a /divisiones/');
    const response = await api.get('/divisiones/');
    console.log('Respuesta del servidor:', response.data);
    
    // Manejar diferentes formatos de respuesta posibles
    if (Array.isArray(response.data)) {
      console.log('La respuesta es un array, devolviéndola directamente');
      return response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      console.log('La respuesta tiene un array en results, devolviéndolo');
      return response.data.results;
    } else if (response.data && typeof response.data === 'object') {
      console.log('La respuesta es un objeto, intentando convertirlo en array');
      // Si es un objeto, intentar convertirlo en array
      const divisiones = Object.values(response.data).filter(item => 
        item && typeof item === 'object' && 'id' in item && 'nombre' in item
      );
      if (divisiones.length > 0) {
        console.log('Objeto convertido exitosamente en array de divisiones');
        return divisiones;
      }
    }
    
    // Si no se pudo obtener un array válido, usar datos simulados como fallback
    console.warn('Formato de respuesta no reconocido, usando datos simulados como fallback');
    return MOCK_DATA.divisiones;
  } catch (error) {
    console.error('Error completo al obtener divisiones:', error);
    // En caso de error, devolver datos simulados como fallback
    console.warn('Error en la petición, usando datos simulados como fallback');
    return MOCK_DATA.divisiones;
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
    throw error;
  }
};

/**
 * Obtiene la lista de jugadores, con opción de filtrar por división
 * @param {Object} params - Parámetros de consulta
 * @param {number} [params.division] - ID de la división para filtrar
 * @param {boolean} [params.activo] - Estado activo/inactivo para filtrar
 * @returns {Promise} - Promesa con la respuesta
 */
export const getJugadores = async (params = {}) => {
  try {
    console.log('getJugadores llamado con params:', params);
    console.log('Modo desarrollo:', DEV_MODE_NO_AUTH);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getJugadores');
      
      // Aplicar filtros según los parámetros (opcional)
      let filteredData = [...MOCK_DATA.jugadores];
      console.log('Datos simulados sin filtrar:', filteredData);
      
      if (params.division) {
        filteredData = filteredData.filter(j => j.division === parseInt(params.division));
      }
      
      if (params.activo !== undefined) {
        const isActivo = params.activo === 'true' || params.activo === true;
        filteredData = filteredData.filter(j => j.activo === isActivo);
      }
      
      console.log('Datos simulados filtrados:', filteredData);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return filteredData;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /jugadores/');
    const response = await api.get('/jugadores/', { params });
    console.log('Respuesta de la API:', response);
    
    // Asegurarnos de devolver el array de jugadores, ya sea directamente o desde results
    const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
    console.log('Datos procesados:', data);
    return data;
    
  } catch (error) {
    console.error('Error completo en getJugadores:', error);
    if (error.response?.status === 401) {
      console.error('Error de autenticación: El usuario no está autenticado');
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
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log(`Usando datos simulados para getJugadorById(${jugadorId})`);
      
      // Buscar el jugador por ID
      const jugador = MOCK_DATA.jugadores.find(j => j.id === parseInt(jugadorId));
      
      // Si no se encuentra, lanzar un error
      if (!jugador) {
        throw new Error('Jugador no encontrado');
      }
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return jugador;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    const response = await api.get(`/jugadores/${jugadorId}/`);
    return response.data;
  } catch (error) {
    if (DEV_MODE_NO_AUTH && error.message === 'Jugador no encontrado') {
      console.error(`Jugador con ID ${jugadorId} no encontrado en datos simulados`);
      throw error;
    }
    
    if (error.response?.status === 401) {
      console.error('Error de autenticación: El usuario no está autenticado');
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    console.error(`Error al obtener detalles del jugador ${jugadorId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Obtiene las atenciones kinésicas, con opción de filtrar por jugador
 * @param {Object} params - Parámetros de consulta
 * @param {number} [params.jugador] - ID del jugador para filtrar
 * @param {number} [params.profesional] - ID del profesional para filtrar
 * @param {string} [params.estado_actual] - Estado actual para filtrar
 * @returns {Promise} - Promesa con la respuesta
 */
export const getAtencionesKinesicas = async (params = {}) => {
  try {
    const response = await api.get('/atenciones/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener atenciones kinésicas:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de una atención kinésica específica
 * @param {number} atencionId - ID de la atención
 * @returns {Promise} - Promesa con la respuesta
 */
export const getAtencionKinesicaById = async (atencionId) => {
  try {
    const response = await api.get(`/atenciones/${atencionId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles de la atención ${atencionId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las lesiones registradas, con opción de filtrar por jugador
 * @param {Object} params - Parámetros de consulta
 * @param {number} [params.jugador] - ID del jugador para filtrar
 * @param {string} [params.tipo_lesion] - Tipo de lesión para filtrar (muscular, ligamentosa, etc.)
 * @param {string} [params.region_cuerpo] - Región del cuerpo para filtrar
 * @returns {Promise} - Promesa con la respuesta
 */
export const getLesiones = async (params = {}) => {
  try {
    const response = await api.get('/lesiones/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener lesiones:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de una lesión específica
 * @param {number} lesionId - ID de la lesión
 * @returns {Promise} - Promesa con la respuesta
 */
export const getLesionById = async (lesionId) => {
  try {
    const response = await api.get(`/lesiones/${lesionId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles de la lesión ${lesionId}:`, error);
    throw error;
  }
};

/**
 * Obtiene los archivos médicos, con opción de filtrar por jugador
 * @param {Object} params - Parámetros de consulta
 * @param {number} [params.jugador] - ID del jugador para filtrar
 * @param {string} [params.tipo_archivo] - Tipo de archivo para filtrar (imagen, informe, otro)
 * @returns {Promise} - Promesa con la respuesta
 */
export const getArchivosMedicos = async (params = {}) => {
  try {
    const response = await api.get('/archivos/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener archivos médicos:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un archivo médico específico
 * @param {number} archivoId - ID del archivo médico
 * @returns {Promise} - Promesa con la respuesta
 */
export const getArchivoMedicoById = async (archivoId) => {
  try {
    const response = await api.get(`/archivos/${archivoId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles del archivo médico ${archivoId}:`, error);
    throw error;
  }
};

/**
 * Obtiene los checklists post-partido, con opción de filtrar por jugador
 * @param {Object} params - Parámetros de consulta
 * @param {number} [params.jugador] - ID del jugador para filtrar
 * @param {boolean} [params.dolor_molestia] - Si hubo dolor/molestia para filtrar
 * @returns {Promise} - Promesa con la respuesta
 */
export const getChecklistsPostPartido = async (params = {}) => {
  try {
    const response = await api.get('/checklists/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener checklists post-partido:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un checklist post-partido específico
 * @param {number} checklistId - ID del checklist
 * @returns {Promise} - Promesa con la respuesta
 */
export const getChecklistPostPartidoById = async (checklistId) => {
  try {
    const response = await api.get(`/checklists/${checklistId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles del checklist ${checklistId}:`, error);
    throw error;
  }
};

// Funciones para crear nuevos registros

/**
 * Crea una nueva atención kinésica
 * @param {Object} datosAtencion - Datos de la atención a crear
 * @returns {Promise} - Promesa con la respuesta
 */
export const addAtencionKinesica = async (datosAtencion) => {
  try {
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para addAtencionKinesica');
      console.log('Datos recibidos:', datosAtencion);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Crear una nueva atención simulada
      const nuevaAtencion = {
        id: MOCK_DATA.atenciones.length + 1,
        ...datosAtencion,
        fecha_creacion: new Date().toISOString(),
        profesional_a_cargo: {
          id: 1,
          nombre: "Kinesiólogo Demo"
        }
      };
      
      // Agregar al mock data
      MOCK_DATA.atenciones.push(nuevaAtencion);
      
      return nuevaAtencion;
    }

    // Si no estamos en modo desarrollo, hacer la petición real
    const response = await api.post('/atenciones/', datosAtencion);
    return response.data;
  } catch (error) {
    console.error('Error al crear atención kinésica:', error);
    throw error.response?.data || error;
  }
};

/**
 * Crea un nuevo registro de lesión
 * @param {Object} lesionData - Datos de la lesión
 * @returns {Promise} - Promesa con la respuesta
 */
export const createLesion = async (lesionData) => {
  try {
    const response = await api.post('/lesiones/', lesionData);
    return response.data;
  } catch (error) {
    console.error('Error al crear registro de lesión:', error);
    throw error;
  }
};

/**
 * Crea un nuevo archivo médico (multipart/form-data para archivos)
 * @param {FormData} formData - FormData con los datos y el archivo
 * @returns {Promise} - Promesa con la respuesta
 */
export const createArchivoMedico = async (formData) => {
  try {
    const response = await api.post('/archivos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear archivo médico:', error);
    throw error;
  }
};

/**
 * Crea un nuevo checklist post-partido
 * @param {Object} checklistData - Datos del checklist
 * @returns {Promise} - Promesa con la respuesta
 */
export const createChecklistPostPartido = async (checklistData) => {
  try {
    const response = await api.post('/checklists/', checklistData);
    return response.data;
  } catch (error) {
    console.error('Error al crear checklist post-partido:', error);
    throw error;
  }
};

/**
 * Sube una nueva foto de perfil para un jugador
 * @param {number} jugadorId - ID del jugador
 * @param {FormData} formData - FormData con la foto (campo 'foto_perfil')
 * @returns {Promise} - Promesa con la respuesta
 */
export const uploadFotoJugador = async (jugadorId, formData) => {
  try {
    // Si estamos en modo desarrollo, simular la subida
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para uploadFotoJugador');
      
      // Buscar el jugador por ID
      const jugador = MOCK_DATA.jugadores.find(j => j.id === parseInt(jugadorId));
      
      // Si no se encuentra, lanzar un error
      if (!jugador) {
        throw new Error('Jugador no encontrado');
      }
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear URL temporal para la foto subida
      const file = formData.get('foto_perfil');
      const tempUrl = URL.createObjectURL(file);
      
      // Actualizar la foto del jugador en MOCK_DATA
      jugador.foto_perfil_url = tempUrl;
      
      return jugador;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    const response = await api.patch(`/jugadores/${jugadorId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading player photo:', error);
    throw error;
  }
};

/**
 * Crea un nuevo jugador
 * @param {Object} datosJugador - Datos del jugador a crear
 * @returns {Promise} - Promesa con la respuesta
 */
export const addJugador = async (datosJugador) => {
  try {
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para addJugador');
      console.log('Datos recibidos:', datosJugador);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear un nuevo jugador simulado
      const nuevoJugador = {
        id: MOCK_DATA.jugadores.length + 1,
        ...datosJugador,
        activo: true,
        created_at: new Date().toISOString()
      };
      
      // Agregar a los datos simulados
      MOCK_DATA.jugadores.push(nuevoJugador);
      
      return nuevoJugador;
    }

    let response;
    
    // Verificar si hay archivo de foto
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
    // Propagar el error para que pueda ser manejado por el componente
    throw error.response?.data || error;
  }
};

/**
 * Crea un nuevo checklist post-partido
 * @param {Object} datosChecklist - Datos del checklist a crear
 * @returns {Promise} Respuesta de la API
 */
export const addChecklist = async (datosChecklist) => {
  try {
    const response = await fetch(`${API_BASE_URL}/checklists/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(datosChecklist)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el checklist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en addChecklist:', error);
    throw error;
  }
};

/**
 * Obtiene las atenciones kinésicas de un jugador específico
 * @param {number} jugadorId - ID del jugador
 * @returns {Promise} - Promesa con la lista de atenciones
 */
export const getAtencionesPorJugador = async (jugadorId) => {
  try {
    if (DEV_MODE_NO_AUTH) {
      console.log(`Usando datos simulados para getAtencionesPorJugador(${jugadorId})`);
      const atencionesFiltradas = MOCK_DATA.atenciones
        .filter(atencion => atencion.jugador === jugadorId)
        .sort((a, b) => new Date(b.fecha_atencion) - new Date(a.fecha_atencion));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      return atencionesFiltradas;
    }

    console.log(`Realizando petición real a /atenciones/?jugador=${jugadorId}`);
    const response = await api.get(`/atenciones/?jugador=${jugadorId}`);
    
    const atenciones = Array.isArray(response.data) ? response.data : response.data.results;
    return atenciones.sort((a, b) => new Date(b.fecha_atencion) - new Date(a.fecha_atencion));
  } catch (error) {
    console.error('Error al obtener atenciones del jugador:', error);
    throw new Error('Error al cargar las atenciones del jugador');
  }
};

// Exportar la instancia api para casos personalizados
export default api; 