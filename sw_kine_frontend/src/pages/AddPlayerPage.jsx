import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDivisiones, addJugador } from '../services/api';

const AddPlayerPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado para cada campo del formulario
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    peso_kg: '',
    estatura_cm: '',
    lateralidad: 'diestro',
    prevision_salud: 'fonasa',
    division: '',
    foto_perfil: null
  });

  // Estado para validación de campos
  const [formErrors, setFormErrors] = useState({});

  // Estado para las divisiones
  const [divisiones, setDivisiones] = useState([]);
  const [loadingDivisiones, setLoadingDivisiones] = useState(true);
  const [errorDivisiones, setErrorDivisiones] = useState(null);

  // Cargar divisiones al montar el componente
  useEffect(() => {
    const fetchDivisiones = async () => {
      try {
        console.log('Iniciando fetchDivisiones...');
        setLoadingDivisiones(true);
        setErrorDivisiones(null);
        const data = await getDivisiones();
        console.log('Datos de divisiones recibidos:', data);
        
        // Verificar que data sea un array
        if (Array.isArray(data)) {
          console.log('Los datos son un array válido');
          setDivisiones(data);
        } else {
          console.error('Los datos no son un array:', data);
          throw new Error('El formato de los datos recibidos no es válido');
        }
      } catch (error) {
        console.error('Error completo al cargar divisiones:', error);
        setErrorDivisiones('Error al cargar las divisiones. Por favor, intente nuevamente.');
        setDivisiones([]); // Asegurar que divisiones sea un array vacío en caso de error
      } finally {
        setLoadingDivisiones(false);
      }
    };

    fetchDivisiones();
  }, []);

  // Función para formatear RUT automáticamente
  const formatearRUT = (rut) => {
    // Limpiar el RUT de cualquier caracter no numérico excepto K
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    
    // Si está vacío, retornar vacío
    if (!rutLimpio) return '';
    
    // Si tiene menos de 2 caracteres, retornar tal como está
    if (rutLimpio.length < 2) return rutLimpio;
    
    // Separar el dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    // Formatear el cuerpo del RUT con puntos
    let cuerpoFormateado = '';
    for (let i = cuerpo.length - 1, contador = 0; i >= 0; i--, contador++) {
      if (contador > 0 && contador % 3 === 0) {
        cuerpoFormateado = '.' + cuerpoFormateado;
      }
      cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    }
    
    return `${cuerpoFormateado}-${dv}`;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el campo RUT, aplicar formateo automático
    if (name === 'rut') {
      const rutFormateado = formatearRUT(value);
      setFormData(prevState => ({
        ...prevState,
        [name]: rutFormateado
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Manejar cambios en el archivo de foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido.');
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB.');
        return;
      }
      setFormData(prevState => ({
        ...prevState,
        foto_perfil: file
      }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const errors = {};
    
    // Validar RUT (formato básico XX.XXX.XXX-X)
    if (!formData.rut.match(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)) {
      errors.rut = 'Ingrese un RUT válido (ej: 12.345.678-9)';
    }

    // Validar nombres
    if (!formData.nombres.trim()) {
      errors.nombres = 'Los nombres son requeridos';
    }

    // Validar apellidos
    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son requeridos';
    }

    // Validar fecha de nacimiento
    if (!formData.fecha_nacimiento) {
      errors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }

    // Validar nacionalidad
    if (!formData.nacionalidad.trim()) {
      errors.nacionalidad = 'La nacionalidad es requerida';
    }

    // Validar peso (si se ingresa)
    if (formData.peso_kg && (isNaN(formData.peso_kg) || formData.peso_kg < 20 || formData.peso_kg > 150)) {
      errors.peso_kg = 'Ingrese un peso válido entre 20 y 150 kg';
    }

    // Validar estatura (si se ingresa)
    if (formData.estatura_cm && (isNaN(formData.estatura_cm) || formData.estatura_cm < 100 || formData.estatura_cm > 250)) {
      errors.estatura_cm = 'Ingrese una estatura válida entre 100 y 250 cm';
    }

    // Validar división
    if (!formData.division) {
      errors.division = 'Seleccione una división';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setShowSuccess(false);

    // Validar formulario
    if (!validateForm()) {
      setSubmitError('Por favor corrija los errores en el formulario antes de continuar.');
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear FormData si hay foto, de lo contrario usar objeto normal
      let datosJugador;
      
      if (formData.foto_perfil) {
        datosJugador = new FormData();
        // Agregar todos los campos al FormData
        Object.keys(formData).forEach(key => {
          if (key === 'foto_perfil') {
            datosJugador.append(key, formData[key]);
          } else if (formData[key] !== '') { // No enviar campos vacíos
            // Convertir campos numéricos
            if (key === 'peso_kg' || key === 'estatura_cm') {
              datosJugador.append(key, parseFloat(formData[key]));
            } else {
              datosJugador.append(key, formData[key]);
            }
          }
        });
      } else {
        // Crear objeto con los datos, excluyendo foto_perfil
        datosJugador = Object.keys(formData).reduce((obj, key) => {
          if (key !== 'foto_perfil' && formData[key] !== '') {
            // Convertir campos numéricos
            if (key === 'peso_kg' || key === 'estatura_cm') {
              obj[key] = parseFloat(formData[key]);
            } else {
              obj[key] = formData[key];
            }
          }
          return obj;
        }, {});
      }

      // Enviar datos al servidor
      const jugadorCreado = await addJugador(datosJugador);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        if (jugadorCreado && jugadorCreado.id) {
          navigate(`/ficha-clinica/jugador/${jugadorCreado.id}`);
        } else {
          navigate('/ficha-clinica');
        }
      }, 2000);
    } catch (error) {
      console.error('Error al crear jugador:', error);
      setSubmitError(
        error.message || 'Error al crear el jugador. Por favor, intente nuevamente.'
      );
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link 
                to="/ficha-clinica" 
                className="text-wanderers-green hover:text-wanderers-green/80 font-medium"
              >
                Fichas Clínicas
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-600 font-medium">
              Nuevo Jugador
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Encabezado */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-wanderers-green">
                Ingresar Nuevo Jugador
              </h1>
              <p className="mt-2 text-gray-600">
                Complete los datos del jugador. Los campos marcados con * son obligatorios.
              </p>
            </div>

            {/* Mensajes de feedback */}
            {submitError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">
                      {submitError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showSuccess && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">
                      Jugador creado exitosamente. Redirigiendo...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Grid para campos del formulario */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                {/* RUT */}
                <div>
                  <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                    RUT *
                  </label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    value={formData.rut}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      formErrors.rut ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12.345.678-9"
                    required
                  />
                  {formErrors.rut && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.rut}</p>
                  )}
                </div>

                {/* División */}
                <div>
                  <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
                    División *
                  </label>
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      formErrors.division ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                    disabled={loadingDivisiones}
                  >
                    <option value="">Seleccione una división</option>
                    {loadingDivisiones ? (
                      <option disabled>Cargando divisiones...</option>
                    ) : errorDivisiones ? (
                      <option disabled>Error al cargar divisiones</option>
                    ) : (
                      divisiones.map(division => (
                        <option key={division.id} value={division.id}>
                          {division.nombre}
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.division && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.division}</p>
                  )}
                  {errorDivisiones && (
                    <p className="mt-1 text-sm text-red-600">{errorDivisiones}</p>
                  )}
                </div>

                {/* Nombres */}
                <div>
                  <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      formErrors.nombres ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.nombres && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nombres}</p>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      formErrors.apellidos ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.apellidos && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.apellidos}</p>
                  )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      formErrors.fecha_nacimiento ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.fecha_nacimiento && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fecha_nacimiento}</p>
                  )}
                </div>

                {/* Nacionalidad */}
                <div>
                  <label htmlFor="nacionalidad" className="block text-sm font-medium text-gray-700 mb-1">
                    Nacionalidad *
                  </label>
                  <input
                    type="text"
                    id="nacionalidad"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent ${
                      formErrors.nacionalidad ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Chilena"
                    required
                  />
                  {formErrors.nacionalidad && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nacionalidad}</p>
                  )}
                </div>

                {/* Lateralidad */}
                <div>
                  <label htmlFor="lateralidad" className="block text-sm font-medium text-gray-700 mb-1">
                    Lateralidad
                  </label>
                  <select
                    id="lateralidad"
                    name="lateralidad"
                    value={formData.lateralidad}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                  >
                    <option value="zurdo">Zurdo</option>
                    <option value="diestro">Diestro</option>
                    <option value="ambidiestro">Ambidiestro</option>
                  </select>
                </div>

                {/* Previsión de Salud */}
                <div>
                  <label htmlFor="prevision_salud" className="block text-sm font-medium text-gray-700 mb-1">
                    Previsión de Salud
                  </label>
                  <select
                    id="prevision_salud"
                    name="prevision_salud"
                    value={formData.prevision_salud}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                  >
                    <option value="fonasa">FONASA</option>
                    <option value="isapre">Isapre</option>
                    <option value="otra">Otra</option>
                  </select>
                </div>

                {/* Peso */}
                <div>
                  <label htmlFor="peso_kg" className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (Kg)
                  </label>
                  <input
                    type="number"
                    id="peso_kg"
                    name="peso_kg"
                    value={formData.peso_kg}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                  />
                </div>

                {/* Estatura */}
                <div>
                  <label htmlFor="estatura_cm" className="block text-sm font-medium text-gray-700 mb-1">
                    Estatura (cm)
                  </label>
                  <input
                    type="number"
                    id="estatura_cm"
                    name="estatura_cm"
                    value={formData.estatura_cm}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                  />
                </div>

                {/* Foto de Perfil */}
                <div className="md:col-span-2">
                  <label htmlFor="foto_perfil" className="block text-sm font-medium text-gray-700 mb-1">
                    Foto de Perfil
                  </label>
                  <input
                    type="file"
                    id="foto_perfil"
                    name="foto_perfil"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-wanderers-green file:text-white hover:file:bg-wanderers-green/90"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Formatos aceptados: JPG, PNG. Tamaño máximo: 5MB
                  </p>
                </div>
              </div>

              {/* Botón de guardar */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-wanderers-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green ${
                    isSubmitting 
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-wanderers-green/90'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Jugador'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlayerPage; 