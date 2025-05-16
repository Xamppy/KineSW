import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJugadorById } from '../services/api';
import FotoUpload from '../components/jugador/FotoUpload';

const JugadorDetailPage = () => {
  const { jugadorId } = useParams();
  const [jugador, setJugador] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);

  // URL base para las imágenes
  const BASE_URL = 'http://localhost:8000';
  const PLACEHOLDER_IMG = '/static/images/player-placeholder.png';

  const fetchJugadorData = async () => {
    try {
      setIsLoading(true);
      const data = await getJugadorById(jugadorId);
      setJugador(data);
    } catch (err) {
      setError('Error al cargar los datos del jugador. Por favor, intente nuevamente.');
      console.error('Error fetching jugador details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJugadorData();
  }, [jugadorId]);

  const handleUploadSuccess = (previewUrl) => {
    // Usar la URL temporal proporcionada por FotoUpload
    setTempImageUrl(previewUrl);
    setImageError(false);
    setImageLoaded(true);
  };

  const imageUrl = tempImageUrl || (jugador?.foto_perfil_url
    ? jugador.foto_perfil_url.startsWith('http')
      ? jugador.foto_perfil_url
      : `${BASE_URL}${jugador.foto_perfil_url}`
    : PLACEHOLDER_IMG);

  // Limpiar la URL temporal al desmontar el componente
  useEffect(() => {
    return () => {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    };
  }, [tempImageUrl]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wanderers-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!jugador) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>No se encontró el jugador solicitado.</p>
        </div>
      </div>
    );
  }

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
            <li className="text-gray-600 font-medium truncate">
              {jugador.nombres} {jugador.apellidos}
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Sección Izquierda - Foto y Datos Básicos */}
            <div className="md:w-1/3 bg-gray-50 p-8 border-r border-gray-200">
              <div className="space-y-8">
                {/* Foto de Perfil */}
                <div className="space-y-6">
                  <div className="relative">
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                        <div className="w-8 h-8 border-2 border-wanderers-green border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={imageError ? PLACEHOLDER_IMG : imageUrl}
                      alt={`Foto de ${jugador.nombres} ${jugador.apellidos}`}
                      className={`w-full aspect-square object-cover rounded-xl shadow-lg transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                  </div>
                  <FotoUpload
                    jugadorId={parseInt(jugadorId)}
                    currentFotoUrl={imageUrl}
                    onUploadSuccess={handleUploadSuccess}
                  />
                </div>

                {/* Datos Básicos */}
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-wanderers-green">
                    {jugador.nombres} {jugador.apellidos}
                  </h1>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      <span className="font-medium text-gray-900">RUT:</span> {jugador.rut}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium text-gray-900">Nº Ficha:</span>{' '}
                      {jugador.numero_ficha || 'No asignado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección Derecha - Datos de la Ficha */}
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-semibold text-wanderers-green mb-8">
                Datos de la Ficha
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                    <p className="mt-1 text-gray-900">{new Date(jugador.fecha_nacimiento).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Edad</p>
                    <p className="mt-1 text-gray-900">{jugador.edad} años</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Nacionalidad</p>
                    <p className="mt-1 text-gray-900">{jugador.nacionalidad}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Lateralidad</p>
                    <p className="mt-1 text-gray-900">{jugador.lateralidad}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Peso</p>
                    <p className="mt-1 text-gray-900">{jugador.peso_kg ? `${jugador.peso_kg} kg` : 'No registrado'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Estatura</p>
                    <p className="mt-1 text-gray-900">{jugador.estatura_cm ? `${jugador.estatura_cm} cm` : 'No registrada'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Previsión</p>
                    <p className="mt-1 text-gray-900">{jugador.prevision_salud}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">División</p>
                    <p className="mt-1 text-gray-900">{jugador.division_nombre || 'No asignada'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Estado:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    jugador.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {jugador.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JugadorDetailPage; 