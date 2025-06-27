import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoSW from '../assets/images/logo-sw.png';
import { login } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
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

  const handleRutChange = (e) => {
    const rutFormateado = formatearRut(e.target.value);
    setRut(rutFormateado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar RUT antes de enviar
    if (!validarRut(rut)) {
      setError('El RUT ingresado no es válido');
      setLoading(false);
      return;
    }
    
    try {
      // Limpiar el RUT antes de enviarlo
      const rutLimpio = rut.replace(/[^0-9kK]/g, '');
      const response = await login({ rut: rutLimpio, password });
      
      // Usar el contexto de autenticación para manejar el login
      authLogin(
        response.access_token,
        response.refresh_token,
        response.user
      );
      
      // La navegación ahora la maneja el contexto
    } catch (err) {
      console.error('Error en el login:', err);
      setError(err.message || 'Credenciales incorrectas. Por favor, verifica tu RUT y contraseña.');
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
        {/* Logo y título */}
        <div className="flex flex-col items-center mb-6">
          <img src={logoSW} alt="Logo Santiago Wanderers" className="w-13 h-auto mb-3 object-contain" />
          <h1 className="text-[#07421a] text-2xl font-bold text-center">Equipo Médico Santiago Wanderers</h1>
        </div>

        {/* Formulario de login */}
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden my-4">
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h2>
            </div>

            {error && (
              <div className="bg-red-50 border-s-4 border-red-500 p-4 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
                  RUT
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="rut"
                    name="rut"
                    type="text"
                    required
                    value={rut}
                    onChange={handleRutChange}
                    className="ps-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="text-sm">
                    <a href="#" className="text-[#07421a] hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ps-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-wanderers-green focus:outline-none focus:ring-wanderers-green sm:text-sm"
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#07421a] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#07421a] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Iniciando...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            </form>



            <div className="text-center text-sm">
              <span className="text-gray-500">¿No tienes una cuenta? </span>
              <Link to="/register" className="text-[#07421a] hover:underline">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 