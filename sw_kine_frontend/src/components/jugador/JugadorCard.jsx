import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import playerPlaceholder from '../../assets/images/logo-sw.png';

const JugadorCard = ({ jugador }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSettings, setImageSettings] = useState({ position: { x: 50, y: 50 }, scale: 1 });

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    // Si hay foto_perfil_url del backend, mostrarla directamente
    if (jugador.foto_perfil_url) {
      return jugador.foto_perfil_url;
    }
    
    // Si no hay foto, mostrar placeholder
    return playerPlaceholder;
  };

  // Cargar configuraciones guardadas de imagen
  useEffect(() => {
    const savedSettings = localStorage.getItem(`image-settings-${jugador.id}`);
    if (savedSettings) {
      setImageSettings(JSON.parse(savedSettings));
    }
  }, [jugador.id]);

  return (
    <Link
      to={`/ficha-clinica/jugador/${jugador.id}`}
      className="block w-full h-full transition-transform duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:ring-opacity-50"
      tabIndex="0"
      aria-label={`Ver ficha clínica de ${jugador.nombres} ${jugador.apellidos}`}
    >
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
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
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-wanderers-green mb-2">
              {jugador.nombres} {jugador.apellidos}
            </h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">RUT:</span> {jugador.rut}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">División:</span>{' '}
                {jugador.division_nombre || 'No asignada'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

JugadorCard.propTypes = {
  jugador: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombres: PropTypes.string.isRequired,
    apellidos: PropTypes.string.isRequired,
    rut: PropTypes.string.isRequired,
    division_nombre: PropTypes.string,
    foto_perfil_url: PropTypes.string
  }).isRequired
};

export default JugadorCard; 