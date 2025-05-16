import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoSW from '../assets/images/logo-sw.png';
import { register } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    rut: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    rol: 'kinesiologo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear el RUT mientras se escribe
  const formatearRut = (rut) => {
    // Eliminar cualquier carácter que no sea número o 'k'
    let valor = rut.replace(/[^0-9kK]/g, '');
    
    // Convertir 'k' minúscula a mayúscula
    valor = valor.replace(/k/g, 'K');
    
    // Si no hay valor, retornar string vacío
    if (!valor) return '';
    
    // Obtener el dígito verificador
    let dv = valor.slice(-1);
    // Obtener el cuerpo del RUT
    let rutCuerpo = valor.slice(0, -1);
    
    // Formatear el cuerpo del RUT con puntos
    let rutFormateado = '';
    for (let i = rutCuerpo.length; i > 0; i -= 3) {
      const inicio = Math.max(0, i - 3);
      rutFormateado = '.' + rutCuerpo.slice(inicio, i) + rutFormateado;
    }
    
    // Eliminar el primer punto si existe
    rutFormateado = rutFormateado.slice(1);
    
    // Retornar RUT formateado con guión y dígito verificador
    return rutFormateado + '-' + dv;
  };

  // Función para validar el RUT
  const validarRut = (rut) => {
    // Eliminar puntos y guión
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    
    if (rutLimpio.length < 2) return false;
    
    const dv = rutLimpio.slice(-1).toUpperCase();
    const rutCuerpo = rutLimpio.slice(0, -1);
    
    let suma = 0;
    let multiplo = 2;
    
    // Calcular dígito verificador
    for (let i = rutCuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(rutCuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dv === dvCalculado;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      // Aplicar formato al RUT
      const rutFormateado = formatearRut(value);
      setFormData(prev => ({
        ...prev,
        [name]: rutFormateado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones básicas
    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar RUT
    if (!validarRut(formData.rut)) {
      setError('El RUT ingresado no es válido');
      setLoading(false);
      return;
    }

    try {
      // Limpiar el RUT antes de enviarlo
      const rutLimpio = formData.rut.replace(/[^0-9kK]/g, '');
      const dataToSend = {
        ...formData,
        rut: rutLimpio
      };
      
      const response = await register(dataToSend);
      
      // Usar el contexto de autenticación para manejar el login automático
      authLogin(
        response.access_token,
        response.refresh_token,
        response.user
      );
      
      // La navegación la maneja el contexto de autenticación
    } catch (err) {
      console.error('Error en el registro:', err);
      // Mostrar errores detallados del backend
      if (err.response?.data?.detail) {
        const errorMessages = Object.entries(err.response.data.detail)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.error || 'Error al crear la cuenta. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Fondo con ondulación en verde */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 left-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#07421a"
            fillOpacity="1"
            d="M0,192L80,208C160,224,320,256,480,245.3C640,235,800,181,960,165.3C1120,149,1280,171,1360,181.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#07421a] via-transparent to-transparent opacity-20"></div>
      </div>

      <div className="flex flex-col items-center relative z-10 w-full max-w-md px-4">


        {/* Formulario de registro */}
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden my-4">
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Crear Cuenta</h2>
            </div>

            {error && (
              <div className="bg-red-50 border-s-4 border-red-500 p-4 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                  RUT
                </label>
                <input
                  id="rut"
                  name="rut"
                  type="text"
                  required
                  value={formData.rut}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                  placeholder="juan.perez@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  required
                  value={formData.rol}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                >
                  <option value="kinesiologo">Kinesiólogo</option>
                  <option value="medico">Médico</option>
                  <option value="auxiliar">Auxiliar Médico</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                  placeholder="********"
                />
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  required
                  value={formData.password2}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                  placeholder="********"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#07421a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#07421a] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-500">¿Ya tienes una cuenta? </span>
              <Link to="/login" className="text-[#07421a] hover:underline">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 