import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const JugadorCard = ({ jugador }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // URL base para las imágenes (ajustar según tu configuración)
  const BASE_URL = 'http://localhost:8000';
  
  // URL de la imagen placeholder (asegúrate de tener esta imagen en tus assets)
  const PLACEHOLDER_IMG = '/static/images/player-placeholder.png';

  const imageUrl = jugador.foto_perfil_url
    ? jugador.foto_perfil_url.startsWith('http')
      ? jugador.foto_perfil_url
      : `${BASE_URL}${jugador.foto_perfil_url}`
    : PLACEHOLDER_IMG;

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Link
      to={`/ficha-clinica/jugador/${jugador.id}`}
      className="block w-full transition-transform duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:ring-opacity-50"
      tabIndex="0"
      aria-label={`Ver ficha clínica de ${jugador.nombres} ${jugador.apellidos}`}
    >
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="relative pb-[100%] bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-wanderers-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageError ? PLACEHOLDER_IMG : imageUrl}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
        <div className="p-4">
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