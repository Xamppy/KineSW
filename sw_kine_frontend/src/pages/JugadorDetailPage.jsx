import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJugadorById } from '../services/api';
import FotoUpload from '../components/jugador/FotoUpload';
import playerPlaceholder from '../assets/images/logo-sw.png';

// Importar las imágenes
import doueImg from '../assets/images/Doue.webp';
import gulerImg from '../assets/images/Guler.webp';
import hakimiImg from '../assets/images/Hakimi.jpg';
import yamalImg from '../assets/images/Yamal.jpeg';
import kvaraImg from '../assets/images/Kvara.jpeg';

const JugadorDetailPage = () => {
  const { jugadorId } = useParams();
  const [jugador, setJugador] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);

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
    setTempImageUrl(previewUrl);
    setImageError(false);
    setImageLoaded(true);
  };

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    if (tempImageUrl) return tempImageUrl;
    if (!jugador?.foto_perfil_url) return playerPlaceholder;
    
    // Mapeo de nombres de archivo a imágenes importadas
    const imageMap = {
      'Doue.webp': doueImg,
      'Guler.webp': gulerImg,
      'Hakimi.jpg': hakimiImg,
      'Yamal.jpeg': yamalImg,
      'Kvara.jpeg': kvaraImg
    };

    // Obtener el nombre del archivo de la ruta
    const fileName = jugador.foto_perfil_url.split('/').pop();
    return imageMap[fileName] || playerPlaceholder;
  };

  // Limpiar la URL temporal al desmontar el componente
  useEffect(() => {
    return () => {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    };
  }, [tempImageUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wanderers-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchJugadorData}
          className="bg-wanderers-green text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!jugador) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-gray-600">No se encontró el jugador solicitado.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Sección Izquierda - Foto y Datos Básicos */}
          <div className="md:w-1/3 border-r border-gray-200">
            <div className="p-8">
              {/* Contenedor de la Foto */}
              <div className="relative aspect-square mb-6 bg-gray-100 rounded-lg overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-wanderers-green border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={imageError ? playerPlaceholder : getImageUrl()}
                  alt={`Foto de ${jugador.nombres} ${jugador.apellidos}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              {/* Componente de Upload */}
              <FotoUpload
                jugadorId={jugador.id}
                onUploadSuccess={handleUploadSuccess}
                className="mb-6"
              />

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
                  <p className="mt-1 text-gray-900">{jugador.peso_kg} kg</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Estatura</p>
                  <p className="mt-1 text-gray-900">{jugador.estatura_cm} cm</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">División</p>
                  <p className="mt-1 text-gray-900">{jugador.division_nombre || 'No asignada'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Previsión de Salud</p>
                  <p className="mt-1 text-gray-900">{jugador.prevision_salud}</p>
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