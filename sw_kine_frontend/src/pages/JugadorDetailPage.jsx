import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJugadorById } from '../services/api';
import FotoUpload from '../components/jugador/FotoUpload';
import ImageEditor from '../components/jugador/ImageEditor';
import playerPlaceholder from '../assets/images/logo-sw.png';

const JugadorDetailPage = () => {
  const { jugadorId } = useParams();
  const [jugador, setJugador] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageSettings, setImageSettings] = useState({ position: { x: 50, y: 50 }, scale: 1 });

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

  const handleUploadSuccess = async (previewUrl) => {
    setTempImageUrl(previewUrl);
    setImageError(false);
    setImageLoaded(true);
    
    // Recargar los datos del jugador para obtener la nueva URL de la foto
    await fetchJugadorData();
    
    // Resetear configuración de imagen
    setImageSettings({ position: { x: 50, y: 50 }, scale: 1 });
    
    // Limpiar la imagen temporal después de un momento para mostrar la nueva foto
    setTimeout(() => {
      setTempImageUrl(null);
    }, 1000);
  };

  // Manejar apertura del editor de imagen
  const handleEditImage = () => {
    const imageUrl = getImageUrl();
    if (imageUrl && imageUrl !== playerPlaceholder) {
      setShowImageEditor(true);
    }
  };

  // Manejar guardado de configuración de imagen
  const handleSaveImageSettings = (newSettings) => {
    setImageSettings(newSettings);
    setShowImageEditor(false);
    // Aquí podrías guardar las configuraciones en localStorage o enviarlas al backend
    localStorage.setItem(`image-settings-${jugadorId}`, JSON.stringify(newSettings));
  };

  // Manejar cancelación del editor
  const handleCancelImageEdit = () => {
    setShowImageEditor(false);
  };

  // Cargar configuraciones guardadas
  useEffect(() => {
    const savedSettings = localStorage.getItem(`image-settings-${jugadorId}`);
    if (savedSettings) {
      setImageSettings(JSON.parse(savedSettings));
    }
  }, [jugadorId]);

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    // Si hay una imagen temporal (recién subida), mostrarla
    if (tempImageUrl) return tempImageUrl;
    
    // Si hay foto_perfil_url del backend, mostrarla directamente
    if (jugador?.foto_perfil_url) {
      return jugador.foto_perfil_url;
    }
    
    // Si no hay foto, mostrar placeholder
    return playerPlaceholder;
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
              <div className="relative aspect-square mb-6 bg-gray-100 rounded-lg overflow-hidden group">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-wanderers-green border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={imageError ? playerPlaceholder : getImageUrl()}
                  alt={`Foto de ${jugador.nombres} ${jugador.apellidos}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    transform: `scale(${imageSettings.scale})`,
                    objectPosition: `${imageSettings.position.x}% ${imageSettings.position.y}%`
                  }}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Botón de edición que aparece al hacer hover */}
                {!imageError && getImageUrl() !== playerPlaceholder && (
                  <button
                    onClick={handleEditImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                    title="Editar posición de la imagen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
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
                  <p className="mt-1 text-gray-900">{new Date(jugador.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-CL')}</p>
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
                  <p className="mt-1 text-gray-900">{jugador.lateralidad?.charAt(0).toUpperCase() + jugador.lateralidad?.slice(1) || 'No especificada'}</p>
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
                  <p className="mt-1 text-gray-900">{jugador.prevision_salud?.toUpperCase() || 'No especificada'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor de imagen */}
      <ImageEditor
        imageUrl={getImageUrl()}
        onSave={handleSaveImageSettings}
        onCancel={handleCancelImageEdit}
        isOpen={showImageEditor}
      />
    </div>
  );
};

export default JugadorDetailPage; 