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
  lesionesActivas: [
    {
      id: 1,
      jugador: {
        id: 1,
        rut: '19.345.678-9',
        nombres: 'Kevin Andrés',
        apellidos: 'Valenzuela Rosales',
        division_nombre: 'Primer Equipo'
      },
      fecha_lesion: '2024-05-20',
      diagnostico_medico: 'Contractura en isquiotibiales izquierdo',
      esta_activa: true,
      tipo_lesion: 'muscular',
      tipo_lesion_display: 'Muscular',
      region_cuerpo: 'muslo_post_izq',
      region_cuerpo_display: 'Muslo Posterior Izquierdo',
      gravedad_lesion: 'moderada',
      gravedad_lesion_display: 'Moderada (8-28 días)',
      dias_recuperacion_estimados: 14,
      historial_diario: [
        {
          id: 1,
          fecha: '2024-12-19',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Evolución favorable, sin dolor en reposo'
        },
        {
          id: 2,
          fecha: '2024-12-18',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Tratamiento con ultrasonido y masaje'
        },
        {
          id: 3,
          fecha: '2024-12-17',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Reducción de inflamación'
        },
        {
          id: 4,
          fecha: '2024-12-16',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Ejercicios de movilidad'
        },
        {
          id: 5,
          fecha: '2024-12-15',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Primera sesión post-lesión'
        },
        {
          id: 6,
          fecha: '2024-12-13',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Fortalecimiento muscular'
        },
        {
          id: 7,
          fecha: '2024-12-12',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Masaje descontracturante'
        },
        {
          id: 8,
          fecha: '2024-12-11',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Ejercicios de estiramiento'
        },
        {
          id: 9,
          fecha: '2024-12-10',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Terapia con hielo'
        },
        {
          id: 10,
          fecha: '2024-12-09',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Ejercicios de rehabilitación'
        }
      ]
    },
    {
      id: 2,
      jugador: {
        id: 3,
        rut: '20.123.456-7',
        nombres: 'Lucas Antonio',
        apellidos: 'Pérez Mendoza',
        division_nombre: 'Primer Equipo'
      },
      fecha_lesion: '2024-05-25',
      diagnostico_medico: 'Esguince grado I en tobillo derecho',
      esta_activa: true,
      tipo_lesion: 'ligamentosa',
      tipo_lesion_display: 'Ligamentosa',
      region_cuerpo: 'tobillo_der',
      region_cuerpo_display: 'Tobillo Derecho',
      gravedad_lesion: 'menor',
      gravedad_lesion_display: 'Menor (4-7 días)',
      dias_recuperacion_estimados: 6,
      historial_diario: [
        {
          id: 11,
          fecha: '2024-12-19',
          estado: 'reintegro',
          estado_display: 'Reintegro Deportivo',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Listo para entrenamientos completos'
        },
        {
          id: 12,
          fecha: '2024-12-18',
          estado: 'reintegro',
          estado_display: 'Reintegro Deportivo',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Pruebas funcionales exitosas'
        },
        {
          id: 13,
          fecha: '2024-12-17',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Ejercicios de propiocepción'
        },
        {
          id: 14,
          fecha: '2024-12-16',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Fortalecimiento de tobillo'
        },
        {
          id: 15,
          fecha: '2024-12-15',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Evaluación inicial'
        },
        {
          id: 16,
          fecha: '2024-12-13',
          estado: 'gimnasio',
          estado_display: 'Tratamiento en Gimnasio',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Movilidad articular'
        },
        {
          id: 17,
          fecha: '2024-12-12',
          estado: 'camilla',
          estado_display: 'Tratamiento en Camilla',
          registrado_por_nombre: 'Dr. Kinesiólogo Demo',
          observaciones: 'Reducción de edema'
        }
      ]
    }
  ],
  lesionesInactivas: [
    {
      id: 3,
      jugador: {
        id: 1,
        rut: '19.345.678-9',
        nombres: 'Kevin Andrés',
        apellidos: 'Valenzuela Rosales',
        division_nombre: 'Primer Equipo'
      },
      fecha_lesion: '2024-03-15',
      fecha_fin: '2024-04-12',
      diagnostico_medico: 'Esguince de tobillo derecho grado II',
      esta_activa: false,
      tipo_lesion: 'ligamentosa',
      tipo_lesion_display: 'Ligamentosa',
      region_cuerpo: 'tobillo_der',
      region_cuerpo_display: 'Tobillo Derecho',
      gravedad_lesion: 'moderada',
      gravedad_lesion_display: 'Moderada (8-28 días)',
      dias_recuperacion_estimados: 21,
      dias_recuperacion_reales: 28
    },
    {
      id: 4,
      jugador: {
        id: 2,
        rut: '18.765.432-1',
        nombres: 'Matías Ignacio',
        apellidos: 'González Rojas',
        division_nombre: 'Primer Equipo'
      },
      fecha_lesion: '2024-02-10',
      fecha_fin: '2024-02-24',
      diagnostico_medico: 'Contractura cervical',
      esta_activa: false,
      tipo_lesion: 'muscular',
      tipo_lesion_display: 'Muscular',
      region_cuerpo: 'cuello',
      region_cuerpo_display: 'Cuello',
      gravedad_lesion: 'leve',
      gravedad_lesion_display: 'Leve (1-3 días)',
      dias_recuperacion_estimados: 7,
      dias_recuperacion_reales: 14
    },
    {
      id: 5,
      jugador: {
        id: 1,
        rut: '19.345.678-9',
        nombres: 'Kevin Andrés',
        apellidos: 'Valenzuela Rosales',
        division_nombre: 'Primer Equipo'
      },
      fecha_lesion: '2023-11-20',
      fecha_fin: '2024-01-15',
      diagnostico_medico: 'Distensión en cuádriceps izquierdo',
      esta_activa: false,
      tipo_lesion: 'muscular',
      tipo_lesion_display: 'Muscular',
      region_cuerpo: 'muslo_ant_izq',
      region_cuerpo_display: 'Muslo Anterior Izquierdo',
      gravedad_lesion: 'grave',
      gravedad_lesion_display: 'Grave (29+ días)',
      dias_recuperacion_estimados: 35,
      dias_recuperacion_reales: 56
    }
  ],
  estadosDiarios: [
    {
      id: 1,
      lesion: 1,
      fecha: '2024-12-19',
      estado: 'gimnasio',
      estado_display: 'Tratamiento en Gimnasio',
      registrado_por_nombre: 'Dr. Kinesiólogo Demo',
      observaciones: 'Evolución favorable, sin dolor en reposo'
    },
    {
      id: 2,
      lesion: 1,
      fecha: '2024-12-18',
      estado: 'camilla',
      estado_display: 'Tratamiento en Camilla',
      registrado_por_nombre: 'Dr. Kinesiólogo Demo',
      observaciones: 'Tratamiento con ultrasonido y masaje'
    },
    {
      id: 3,
      lesion: 2,
      fecha: '2024-12-19',
      estado: 'reintegro',
      estado_display: 'Reintegro Deportivo',
      registrado_por_nombre: 'Dr. Kinesiólogo Demo',
      observaciones: 'Listo para entrenamientos completos'
    },
    {
      id: 4,
      lesion: 1,
      fecha: '2024-12-17',
      estado: 'camilla',
      estado_display: 'Tratamiento en Camilla',
      registrado_por_nombre: 'Dr. Kinesiólogo Demo',
      observaciones: 'Reducción de inflamación'
    },
    {
      id: 5,
      lesion: 2,
      fecha: '2024-12-18',
      estado: 'reintegro',
      estado_display: 'Reintegro Deportivo',
      registrado_por_nombre: 'Dr. Kinesiólogo Demo',
      observaciones: 'Pruebas funcionales exitosas'
    }
  ],
  estadosLesionOpciones: [
    { value: 'camilla', label: 'Tratamiento en Camilla' },
    { value: 'gimnasio', label: 'Tratamiento en Gimnasio' },
    { value: 'reintegro', label: 'Reintegro Deportivo' }
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
  ],
  checklistsPostPartido: [
    {
      id: 1,
      jugador: {
        id: 1,
        rut: '19.345.678-9',
        nombres: 'Kevin Andrés',
        apellidos: 'Valenzuela Rosales',
        division_nombre: 'Primer Equipo'
      },
      fecha_partido: '2024-01-15',
      rival: 'Universidad de Chile',
      division: 'Primera División',
      ubicacion_partido: 'Local',
      dolor_molestia: true,
      ubicacion_dolor: 'Muslo izquierdo',
      intensidad_dolor: 6,
      mecanismo_lesion: 'sin_contacto',
      momento_aparicion: 'durante_partido',
      diagnostico_presuntivo: 'Posible distensión muscular en isquiotibiales',
      tratamiento_inmediato: 'Aplicación de hielo y reposo inmediato',
      observaciones_jugador: 'Molestia al correr, se intensifica con esfuerzo',
      kinesiologo: {
        id: 1,
        nombre: 'Dr. Juan Pérez'
      },
      observaciones_kinesiologo: 'Evaluación post-partido. Molestia muscular leve en isquiotibiales izquierdo, seguimiento recomendado. Aplicar protocolo RICE.',
      fecha_registro: '2024-01-15T22:30:00Z'
    },
    {
      id: 2,
      jugador: {
        id: 2,
        rut: '18.765.432-1',
        nombres: 'Matías Ignacio',
        apellidos: 'González Rojas',
        division_nombre: 'Primer Equipo'
      },
      fecha_partido: '2024-01-15',
      rival: 'Universidad de Chile',
      division: 'Primera División',
      ubicacion_partido: 'Local',
      dolor_molestia: false,
      ubicacion_dolor: null,
      intensidad_dolor: null,
      mecanismo_lesion: null,
      momento_aparicion: null,
      diagnostico_presuntivo: null,
      tratamiento_inmediato: null,
      observaciones_jugador: 'Sin molestias, me siento en óptimas condiciones',
      kinesiologo: {
        id: 1,
        nombre: 'Dr. Juan Pérez'
      },
      observaciones_kinesiologo: 'Evaluación normal, sin molestias reportadas. Jugador en condiciones óptimas para próximo partido.',
      fecha_registro: '2024-01-15T22:35:00Z'
    },
    {
      id: 3,
      jugador: {
        id: 3,
        rut: '20.123.456-7',
        nombres: 'Lucas Antonio',
        apellidos: 'Pérez Mendoza',
        division_nombre: 'Primer Equipo'
      },
      fecha_partido: '2024-01-10',
      rival: 'Colo-Colo',
      division: 'Primera División',
      ubicacion_partido: 'Visita',
      dolor_molestia: true,
      ubicacion_dolor: 'Tobillo derecho',
      intensidad_dolor: 4,
      mecanismo_lesion: 'contacto_directo',
      momento_aparicion: 'durante_partido',
      diagnostico_presuntivo: 'Esguince leve de tobillo grado I',
      tratamiento_inmediato: 'Vendaje funcional y hielo',
      observaciones_jugador: 'Leve molestia en tobillo, no impide caminar',
      kinesiologo: {
        id: 2,
        nombre: 'Dr. María González'
      },
      observaciones_kinesiologo: 'Molestia leve en tobillo derecho tras entrada rival. Evaluación en próxima sesión para descartar lesión ligamentosa.',
      fecha_registro: '2024-01-10T21:45:00Z'
    },
    {
      id: 4,
      jugador: {
        id: 4,
        rut: '19.876.543-2',
        nombres: 'Diego Alejandro',
        apellidos: 'Soto Vargas',
        division_nombre: 'Primer Equipo'
      },
      fecha_partido: '2024-01-10',
      rival: 'Colo-Colo',
      division: 'Primera División',
      ubicacion_partido: 'Visita',
      dolor_molestia: false,
      ubicacion_dolor: null,
      intensidad_dolor: null,
      mecanismo_lesion: null,
      momento_aparicion: null,
      diagnostico_presuntivo: null,
      tratamiento_inmediato: null,
      observaciones_jugador: 'Todo bien, partido intenso pero sin problemas',
      kinesiologo: {
        id: 2,
        nombre: 'Dr. María González'
      },
      observaciones_kinesiologo: 'Sin molestias reportadas, estado óptimo. Excelente recuperación post-partido.',
      fecha_registro: '2024-01-10T21:50:00Z'
    },
    {
      id: 5,
      jugador: {
        id: 5,
        rut: '20.234.567-8',
        nombres: 'Sebastián Eduardo',
        apellidos: 'Martínez Castro',
        division_nombre: 'Primer Equipo'
      },
      fecha_partido: '2024-01-05',
      rival: 'Everton',
      division: 'Primera División',
      ubicacion_partido: 'Local',
      dolor_molestia: true,
      ubicacion_dolor: 'Espalda baja',
      intensidad_dolor: 7,
      mecanismo_lesion: 'sobrecarga',
      momento_aparicion: 'post_partido',
      diagnostico_presuntivo: 'Contractura muscular paravertebral lumbar',
      tratamiento_inmediato: 'Masaje descontracturante y relajantes musculares',
      observaciones_jugador: 'Dolor al agacharse y levantarse, molestia constante',
      kinesiologo: {
        id: 1,
        nombre: 'Dr. Juan Pérez'
      },
      observaciones_kinesiologo: 'Molestia en zona lumbar por sobrecarga. Requiere evaluación más detallada y tratamiento kinésico. Descanso recomendado.',
      fecha_registro: '2024-01-05T22:15:00Z'
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

/**
 * Obtiene todos los checklists post-partido registrados
 * @param {Object} params - Parámetros de consulta opcionales
 * @param {string} [params.fecha_partido] - Filtrar por fecha de partido (YYYY-MM-DD)
 * @param {number} [params.jugador] - Filtrar por ID de jugador
 * @param {string} [params.rival] - Filtrar por nombre del rival
 * @param {boolean} [params.dolor_molestia] - Filtrar por si hubo dolor/molestia
 * @returns {Promise} - Promesa con la lista de checklists
 */
export const getHistorialChecklists = async (params = {}) => {
  try {
    console.log('getHistorialChecklists llamado con params:', params);
    console.log('Modo desarrollo:', DEV_MODE_NO_AUTH);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getHistorialChecklists');
      
      // Aplicar filtros según los parámetros
      let filteredData = [...MOCK_DATA.checklistsPostPartido];
      console.log('Datos simulados sin filtrar:', filteredData);
      
      if (params.fecha_partido) {
        filteredData = filteredData.filter(checklist => 
          checklist.fecha_partido === params.fecha_partido
        );
      }
      
      if (params.jugador) {
        filteredData = filteredData.filter(checklist => 
          checklist.jugador.id === parseInt(params.jugador)
        );
      }
      
      if (params.rival) {
        filteredData = filteredData.filter(checklist => 
          checklist.rival.toLowerCase().includes(params.rival.toLowerCase())
        );
      }
      
      if (params.dolor_molestia !== undefined) {
        const tieneDolorMolestia = params.dolor_molestia === 'true' || params.dolor_molestia === true;
        filteredData = filteredData.filter(checklist => 
          checklist.dolor_molestia === tieneDolorMolestia
        );
      }
      
      // Ordenar por fecha de partido (más recientes primero)
      filteredData.sort((a, b) => new Date(b.fecha_partido) - new Date(a.fecha_partido));
      
      console.log('Datos simulados filtrados y ordenados:', filteredData);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return filteredData;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /api/checklists/');
    
    // Agregar ordenamiento por fecha de partido descendente
    const requestParams = {
      ...params,
      ordering: '-fecha_partido_evaluado' // Ordenar por fecha de partido descendente
    };
    
    const response = await api.get('/api/checklists/', { params: requestParams });
    console.log('Respuesta de la API:', response);
    
    // Asegurarnos de devolver el array de checklists, ya sea directamente o desde results
    const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
    console.log('Datos procesados:', data);
    
    // Si el backend no soportó el ordenamiento, ordenar en frontend como fallback
    if (Array.isArray(data)) {
      data.sort((a, b) => new Date(b.fecha_partido || b.fecha_partido_evaluado || 0) - new Date(a.fecha_partido || a.fecha_partido_evaluado || 0));
    }
    
    return data;
    
  } catch (error) {
    console.error('Error completo en getHistorialChecklists:', error);
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
    console.log('=== CREATE LESION DEBUG ===');
    console.log('Datos enviados:', lesionData);
    console.log('Tipo de datos:', typeof lesionData);
    console.log('Estructura:', JSON.stringify(lesionData, null, 2));
    console.log('Modo desarrollo:', DEV_MODE_NO_AUTH);
    
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para createLesion');
      
      // Validaciones básicas en modo desarrollo
      if (!lesionData.jugador) {
        throw new Error('El campo jugador es requerido');
      }
      if (!lesionData.fecha_lesion) {
        throw new Error('El campo fecha_lesion es requerido');
      }
      if (!lesionData.diagnostico_medico || !lesionData.diagnostico_medico.trim()) {
        throw new Error('El campo diagnostico_medico es requerido');
      }
      
      // Verificar que el jugador existe
      const jugadorExiste = MOCK_DATA.jugadores.find(j => j.id === lesionData.jugador);
      if (!jugadorExiste) {
        throw new Error('El jugador seleccionado no existe');
      }
      
      // Función para generar display names correctos
      const getDisplayValues = (lesionData) => {
        const displays = {};
        
        // Gravedad con formato completo
        switch (lesionData.gravedad_lesion) {
          case 'leve':
            displays.gravedad_lesion_display = 'Leve (1-3 días)';
            break;
          case 'menor':
            displays.gravedad_lesion_display = 'Menor (4-7 días)';
            break;
          case 'moderada':
            displays.gravedad_lesion_display = 'Moderada (8-28 días)';
            break;
          case 'grave':
            displays.gravedad_lesion_display = 'Grave (29+ días)';
            break;
          case 'severa':
            displays.gravedad_lesion_display = 'Severa (29+ días)';
            break;
          default:
            displays.gravedad_lesion_display = lesionData.gravedad_lesion ? 
              lesionData.gravedad_lesion.charAt(0).toUpperCase() + lesionData.gravedad_lesion.slice(1) : 
              'Sin especificar';
        }
        
        // Tipo de lesión con formato
        switch (lesionData.tipo_lesion) {
          case 'muscular':
            displays.tipo_lesion_display = 'Muscular';
            break;
          case 'ligamentosa':
            displays.tipo_lesion_display = 'Ligamentosa';
            break;
          case 'osea':
          case 'ósea':
            displays.tipo_lesion_display = 'Ósea';
            break;
          case 'tendinosa':
            displays.tipo_lesion_display = 'Tendinosa';
            break;
          case 'articular':
            displays.tipo_lesion_display = 'Articular';
            break;
          default:
            displays.tipo_lesion_display = lesionData.tipo_lesion ? 
              lesionData.tipo_lesion.charAt(0).toUpperCase() + lesionData.tipo_lesion.slice(1) : 
              'Sin especificar';
        }
        
        // Región del cuerpo con formato (simplificado)
        displays.region_cuerpo_display = lesionData.region_cuerpo ? 
          lesionData.region_cuerpo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
          'Sin especificar';
        
        return displays;
      };
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar valores display
      const displayValues = getDisplayValues(lesionData);
      
      // Crear una nueva lesión simulada
      const nuevaLesion = {
        id: Date.now(), // ID simulado único
        ...lesionData,
        jugador: jugadorExiste, // Incluir datos completos del jugador
        esta_activa: true,
        fecha_creacion: new Date().toISOString(),
        ...displayValues // Incluir todos los campos display generados
      };
      
      // Agregar a los datos simulados (opcional)
      MOCK_DATA.lesionesActivas = MOCK_DATA.lesionesActivas || [];
      MOCK_DATA.lesionesActivas.push(nuevaLesion);
      
      console.log('Lesión simulada creada:', nuevaLesion);
      console.log('Display values generados:', displayValues);
      return nuevaLesion;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    const response = await api.post('/lesiones/', lesionData);
    console.log('Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear registro de lesión:', error);
    
    // Si es modo desarrollo y el error es de validación, propagar directamente
    if (DEV_MODE_NO_AUTH && error.message && !error.response) {
      throw error;
    }
    
    // Capturar detalles específicos del error 400
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      
      // Si es un error 400, intentar mostrar detalles específicos
      if (error.response.status === 400) {
        console.error('=== ERROR 400 DETAILS ===');
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        
        // Crear mensaje de error más específico
        let errorMessage = 'Error de validación: ';
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage += error.response.data;
          } else if (error.response.data.detail) {
            errorMessage += error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage += error.response.data.message;
          } else if (typeof error.response.data === 'object') {
            // Si es un objeto con errores de validación por campo
            const fieldErrors = [];
            for (const [field, messages] of Object.entries(error.response.data)) {
              if (Array.isArray(messages)) {
                fieldErrors.push(`${field}: ${messages.join(', ')}`);
              } else {
                fieldErrors.push(`${field}: ${messages}`);
              }
            }
            errorMessage += fieldErrors.join('; ');
          }
        } else {
          errorMessage += 'Error desconocido de validación';
        }
        
        // Crear error con mensaje mejorado
        const enhancedError = new Error(errorMessage);
        enhancedError.response = error.response;
        enhancedError.validationDetails = error.response.data;
        throw enhancedError;
      }
    }
    
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
 * @param {Object} datosChecklist - Datos del checklist a crear
 * @returns {Promise} Respuesta de la API
 */
export const addChecklist = async (datosChecklist) => {
  try {
    console.log('addChecklist llamado con datos:', datosChecklist);
    console.log('Modo desarrollo:', DEV_MODE_NO_AUTH);
    
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para addChecklist');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar los datos completos del jugador
      const jugadorCompleto = MOCK_DATA.jugadores.find(j => j.id === parseInt(datosChecklist.jugador));
      
      if (!jugadorCompleto) {
        throw new Error('Jugador no encontrado');
      }
      
      // Crear un nuevo checklist simulado con estructura completa
      const nuevoChecklist = {
        id: MOCK_DATA.checklistsPostPartido.length + 1,
        jugador: {
          id: jugadorCompleto.id,
          rut: jugadorCompleto.rut,
          nombres: jugadorCompleto.nombres,
          apellidos: jugadorCompleto.apellidos,
          division_nombre: jugadorCompleto.division_nombre
        },
        fecha_partido: datosChecklist.fecha_partido_evaluado,
        rival: datosChecklist.rival || 'No especificado',
        division: 'Primera División', // Por defecto
        ubicacion_partido: 'Local', // Por defecto, se puede mejorar más tarde
        dolor_molestia: datosChecklist.dolor_molestia,
        ubicacion_dolor: datosChecklist.zona_anatomica_dolor || null,
        intensidad_dolor: datosChecklist.intensidad_dolor ? parseInt(datosChecklist.intensidad_dolor) : null,
        mecanismo_lesion: datosChecklist.mecanismo_dolor_evaluado || null,
        momento_aparicion: datosChecklist.momento_aparicion_molestia || null,
        diagnostico_presuntivo: datosChecklist.diagnostico_presuntivo_postpartido || null,
        tratamiento_inmediato: datosChecklist.tratamiento_inmediato_realizado || null,
        observaciones_jugador: datosChecklist.observaciones_checklist || null,
        kinesiologo: {
          id: 1,
          nombre: 'Dr. Kinesiólogo Demo'
        },
        observaciones_kinesiologo: `Evaluación post-partido realizada el ${new Date().toLocaleDateString('es-CL')}. ${datosChecklist.dolor_molestia ? 'Se reportaron molestias que requieren seguimiento.' : 'Sin molestias reportadas.'}`,
        fecha_registro: new Date().toISOString()
      };
      
      // Agregar al mock data
      MOCK_DATA.checklistsPostPartido.push(nuevoChecklist);
      
      console.log('Checklist simulado creado:', nuevoChecklist);
      return nuevoChecklist;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /checklists/');
    const response = await api.post('/checklists/', datosChecklist);
    console.log('Respuesta de la API:', response);
    
    return response.data;
  } catch (error) {
    console.error('Error en addChecklist:', error);
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

// ===== FUNCIONES PARA MANEJO DE ESTADOS DE LESIÓN =====

/**
 * Obtiene la lista de jugadores que actualmente tienen lesiones activas
 * @returns {Promise} - Promesa con la lista de lesiones activas con información del jugador
 */
export const getJugadoresConLesionActiva = async () => {
  try {
    console.log('getJugadoresConLesionActiva llamado');
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getJugadoresConLesionActiva');
      console.log('Lesiones activas simuladas:', MOCK_DATA.lesionesActivas);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return MOCK_DATA.lesionesActivas;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /lesiones/activas/');
    const response = await api.get('/lesiones/activas/');
    console.log('Respuesta de lesiones activas:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error completo en getJugadoresConLesionActiva:', error);
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
 * Obtiene el historial diario de una lesión específica
 * @param {number} lesionId - ID de la lesión
 * @returns {Promise} - Promesa con el historial diario de la lesión
 */
export const getHistorialDiarioLesion = async (lesionId) => {
  try {
    console.log(`getHistorialDiarioLesion llamado para lesión ID: ${lesionId}`);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getHistorialDiarioLesion');
      
      // Filtrar estados diarios por lesión
      const historialFiltrado = MOCK_DATA.estadosDiarios
        .filter(estado => estado.lesion === parseInt(lesionId))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      console.log('Historial filtrado:', historialFiltrado);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return historialFiltrado;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /lesiones/${lesionId}/historial_diario/`);
    const response = await api.get(`/lesiones/${lesionId}/historial_diario/`);
    console.log('Respuesta del historial diario:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener historial diario de la lesión ${lesionId}:`, error);
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
 * Añade un nuevo estado diario para una lesión
 * @param {number} lesionId - ID de la lesión
 * @param {string} estado - Estado del día ('camilla', 'gimnasio', 'reintegro')
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise} - Promesa con el estado diario creado
 */
export const addEstadoDiario = async (lesionId, estado, fecha, observaciones = '') => {
  try {
    console.log(`addEstadoDiario llamado - Lesión: ${lesionId}, Estado: ${estado}, Fecha: ${fecha}`);
    
    const estadoData = {
      lesion: lesionId,
      estado: estado,
      fecha: fecha,
      observaciones: observaciones
    };
    
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para addEstadoDiario');
      console.log('Datos del estado:', estadoData);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Crear nuevo estado simulado
      const nuevoEstado = {
        id: MOCK_DATA.estadosDiarios.length + 1,
        ...estadoData,
        estado_display: MOCK_DATA.estadosLesionOpciones.find(opt => opt.value === estado)?.label || estado,
        registrado_por_nombre: 'Dr. Kinesiólogo Demo'
      };
      
      // Agregar al mock data
      MOCK_DATA.estadosDiarios.push(nuevoEstado);
      
      console.log('Nuevo estado creado:', nuevoEstado);
      return nuevoEstado;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /estados-diarios/');
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
 * Finaliza una lesión marcándola como inactiva
 * @param {number} lesionId - ID de la lesión a finalizar
 * @returns {Promise} - Promesa con la respuesta de finalización
 */
export const finalizarLesion = async (lesionId) => {
  try {
    console.log(`finalizarLesion llamado para lesión ID: ${lesionId}`);
    
    // Si estamos en modo desarrollo, simular la finalización
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para finalizarLesion');
      
      // Buscar la lesión en los datos simulados
      const lesionIndex = MOCK_DATA.lesionesActivas.findIndex(lesion => lesion.id === parseInt(lesionId));
      
      if (lesionIndex === -1) {
        throw new Error('Lesión no encontrada');
      }
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marcar la lesión como finalizada (removerla de activas)
      const lesionFinalizada = MOCK_DATA.lesionesActivas[lesionIndex];
      MOCK_DATA.lesionesActivas.splice(lesionIndex, 1);
      
      const respuesta = {
        status: 'success',
        message: 'Lesión finalizada correctamente',
        fecha_fin: new Date().toISOString().split('T')[0],
        lesion: lesionFinalizada
      };
      
      console.log('Lesión finalizada:', respuesta);
      return respuesta;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /lesiones/${lesionId}/finalizar/`);
    const response = await api.post(`/lesiones/${lesionId}/finalizar/`);
    console.log('Respuesta de finalización de lesión:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al finalizar lesión ${lesionId}:`, error);
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
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getPosiblesEstadosLesion');
      
      // Simular retraso de red mínimo
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return MOCK_DATA.estadosLesionOpciones;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /estados-lesion-opciones/');
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
    // En caso de error, devolver opciones hardcodeadas como fallback
    console.warn('Error en la petición, usando opciones hardcodeadas como fallback');
    return [
      { value: 'camilla', label: 'Tratamiento en Camilla' },
      { value: 'gimnasio', label: 'Tratamiento en Gimnasio' },
      { value: 'reintegro', label: 'Reintegro Deportivo' }
    ];
  }
};

/**
 * Obtiene todas las lesiones (activas e inactivas) de un jugador específico
 * @param {number} jugadorId - ID del jugador
 * @returns {Promise} - Promesa con todas las lesiones del jugador
 */
export const getAllLesionesPorJugador = async (jugadorId) => {
  try {
    console.log(`getAllLesionesPorJugador llamado para jugador ID: ${jugadorId}`);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getAllLesionesPorJugador');
      
      // Buscar todas las lesiones del jugador (activas e inactivas)
      const lesionesJugador = [
        ...MOCK_DATA.lesionesActivas.filter(lesion => lesion.jugador.id === parseInt(jugadorId)),
        ...MOCK_DATA.lesionesInactivas.filter(lesion => lesion.jugador.id === parseInt(jugadorId))
      ];
      
      // Ordenar por fecha de lesión (más recientes primero)
      lesionesJugador.sort((a, b) => new Date(b.fecha_lesion) - new Date(a.fecha_lesion));
      
      console.log(`Lesiones encontradas para jugador ${jugadorId}:`, lesionesJugador);
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return lesionesJugador;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /api/lesiones/?jugador=${jugadorId}&activas=all`);
    const response = await api.get('/api/lesiones/', { 
      params: { 
        jugador: jugadorId,
        activas: 'all' // Parámetro para obtener todas las lesiones (activas e inactivas)
      } 
    });
    console.log('Respuesta de lesiones del jugador:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener lesiones del jugador ${jugadorId}:`, error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// =====================================
// === FUNCIONES PARA PARTIDOS ===
// =====================================

/**
 * Obtiene todos los partidos
 * @param {Object} params - Parámetros de filtrado (fecha_desde, fecha_hasta, condicion)
 * @returns {Promise} - Promesa con la lista de partidos
 */
export const getPartidos = async (params = {}) => {
  try {
    console.log('getPartidos llamado con parámetros:', params);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getPartidos');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Datos simulados de partidos
      const partidosSimulados = [
        {
          id: 1,
          fecha: '2024-12-15',
          fecha_str: '15/12/2024',
          rival: 'Universidad de Chile',
          condicion: 'local',
          condicion_display: 'Local',
          convocados: [1, 2, 3, 4, 5],
          convocados_detalle: MOCK_DATA.jugadores.slice(0, 5)
        },
        {
          id: 2,
          fecha: '2024-12-08',
          fecha_str: '08/12/2024',
          rival: 'Colo-Colo',
          condicion: 'visitante',
          condicion_display: 'Visitante',
          convocados: [1, 2, 3],
          convocados_detalle: MOCK_DATA.jugadores.slice(0, 3)
        },
        {
          id: 3,
          fecha: '2024-12-01',
          fecha_str: '01/12/2024',
          rival: 'Universidad Católica',
          condicion: 'local',
          condicion_display: 'Local',
          convocados: [2, 3, 4, 5],
          convocados_detalle: MOCK_DATA.jugadores.slice(1, 5)
        }
      ];
      
      return partidosSimulados;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /partidos/');
    const response = await api.get('/partidos/', { params });
    console.log('Respuesta de partidos:', response.data);
    
    return response.data;
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
 * @returns {Promise} - Promesa con los datos del partido
 */
export const getPartidoById = async (partidoId) => {
  try {
    console.log(`getPartidoById llamado para ID: ${partidoId}`);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getPartidoById');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Buscar partido simulado
      const partido = {
        id: parseInt(partidoId),
        fecha: '2024-12-15',
        fecha_str: '15/12/2024',
        rival: 'Universidad de Chile',
        condicion: 'local',
        condicion_display: 'Local',
        convocados: [1, 2, 3, 4, 5],
        convocados_detalle: MOCK_DATA.jugadores.slice(0, 5)
      };
      
      return partido;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /partidos/${partidoId}/`);
    const response = await api.get(`/partidos/${partidoId}/`);
    console.log('Respuesta del partido:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener partido ${partidoId}:`, error);
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
 * @param {Object} partidoData - Datos del partido (fecha, rival, condicion)
 * @returns {Promise} - Promesa con el partido creado
 */
export const createPartido = async (partidoData) => {
  try {
    console.log('createPartido llamado con datos:', partidoData);
    
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para createPartido');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const nuevoPartido = {
        id: Date.now(), // ID temporal
        ...partidoData,
        fecha_str: new Date(partidoData.fecha).toLocaleDateString('es-CL'),
        condicion_display: partidoData.condicion === 'local' ? 'Local' : 'Visitante',
        convocados: [],
        convocados_detalle: []
      };
      
      console.log('Partido creado:', nuevoPartido);
      return nuevoPartido;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /partidos/');
    const response = await api.post('/partidos/', partidoData);
    console.log('Respuesta de creación de partido:', response.data);
    
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
 * @returns {Promise} - Promesa con el resultado de la actualización
 */
export const updateConvocatoria = async (partidoId, jugadoresIds) => {
  try {
    console.log(`updateConvocatoria llamado para partido ${partidoId} con jugadores:`, jugadoresIds);
    
    // Si estamos en modo desarrollo, simular la actualización
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para updateConvocatoria');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Convocatoria actualizada exitosamente');
      return {
        message: 'Convocatoria actualizada exitosamente',
        convocados_count: jugadoresIds.length
      };
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /partidos/${partidoId}/`);
    const response = await api.patch(`/partidos/${partidoId}/`, {
      convocados: jugadoresIds
    });
    console.log('Respuesta de actualización de convocatoria:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar convocatoria del partido ${partidoId}:`, error);
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
 * Obtiene los jugadores convocados para un partido específico
 * @param {number} partidoId - ID del partido
 * @returns {Promise} - Promesa con la lista de jugadores convocados
 */
export const getConvocados = async (partidoId) => {
  try {
    console.log(`getConvocados llamado para partido ${partidoId}`);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getConvocados');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Simular convocados
      const convocados = MOCK_DATA.jugadores.slice(0, 5);
      
      return convocados;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /partidos/${partidoId}/convocados/`);
    const response = await api.get(`/partidos/${partidoId}/convocados/`);
    console.log('Respuesta de convocados:', response.data);
    
    return response.data;
  } catch (error) {
    console.error(`Error al obtener convocados del partido ${partidoId}:`, error);
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
 * Crea un nuevo checklist post-partido (versión actualizada para el nuevo flujo)
 * @param {Object} checklistData - Datos del checklist incluyendo partidoId
 * @returns {Promise} - Promesa con el checklist creado
 */
export const createChecklistPartido = async (checklistData) => {
  try {
    console.log('createChecklistPartido llamado con datos:', checklistData);
    
    // Si estamos en modo desarrollo, simular la creación
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para createChecklistPartido');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const nuevoChecklist = {
        id: Date.now(),
        ...checklistData,
        fecha_registro_checklist: new Date().toISOString(),
        jugador_nombre: MOCK_DATA.jugadores.find(j => j.id === checklistData.jugador)?.nombres + ' ' + 
                       MOCK_DATA.jugadores.find(j => j.id === checklistData.jugador)?.apellidos,
        realizado_por_nombre: 'Dr. Kinesiólogo Demo'
      };
      
      console.log('Checklist creado:', nuevoChecklist);
      return nuevoChecklist;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log('Realizando petición real a /checklists/');
    const response = await api.post('/checklists/', checklistData);
    console.log('Respuesta de creación de checklist:', response.data);
    
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
 * @returns {Promise} - Promesa con los checklists del partido
 */
export const getChecklistsPorPartido = async (partidoId) => {
  try {
    console.log(`getChecklistsPorPartido llamado para partido ${partidoId}`);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (DEV_MODE_NO_AUTH) {
      console.log('Usando datos simulados para getChecklistsPorPartido');
      
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular checklists
      const checklists = [
        {
          id: 1,
          jugador: 1,
          jugador_nombre: 'Kevin Andrés Valenzuela Rosales',
          partido: parseInt(partidoId),
          dolor_molestia: false,
          observaciones_checklist: 'Sin molestias reportadas.',
          fecha_registro_checklist: '2024-12-15T20:30:00.000Z'
        },
        {
          id: 2,
          jugador: 2,
          jugador_nombre: 'Matías Ignacio González Rojas',
          partido: parseInt(partidoId),
          dolor_molestia: true,
          intensidad_dolor: 'LEVE',
          zona_anatomica_dolor: 'MUSLO',
          observaciones_checklist: 'Molestia leve en muslo derecho.',
          fecha_registro_checklist: '2024-12-15T20:35:00.000Z'
        }
      ];
      
      return checklists;
    }
    
    // Si no estamos en modo desarrollo, hacer la petición real
    console.log(`Realizando petición real a /checklists/por_partido/?partido_id=${partidoId}`);
    const response = await api.get('/checklists/por_partido/', {
      params: { partido_id: partidoId }
    });
    console.log('Respuesta de checklists por partido:', response.data);
    
    return response.data.checklists || response.data;
  } catch (error) {
    console.error(`Error al obtener checklists del partido ${partidoId}:`, error);
    if (error.response?.status === 401) {
      throw { 
        message: 'Sesión expirada o no iniciada. Por favor inicie sesión nuevamente.',
        isAuthError: true
      };
    }
    throw error.response?.data || error;
  }
};

// Exportar la instancia api para casos personalizados
export default api; 