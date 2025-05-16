import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import playerPlaceholder from '../../assets/images/logo-sw.png';

// Importar las imágenes
import doueImg from '../../assets/images/Doue.webp';
import gulerImg from '../../assets/images/Guler.webp';
import hakimiImg from '../../assets/images/Hakimi.jpg';
import yamalImg from '../../assets/images/Yamal.jpeg';
import kvaraImg from '../../assets/images/Kvara.jpeg';

const JugadorCard = ({ jugador }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Función para obtener la URL de la imagen
  const getImageUrl = () => {
    if (!jugador.foto_perfil_url) return playerPlaceholder;
    
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

  return (
    <Link
      to={`/ficha-clinica/jugador/${jugador.id}`}
      className="block w-full h-full transition-transform duration-200 hover:scale-102 focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:ring-opacity-50"
      tabIndex="0"
      aria-label={`Ver ficha clínica de ${jugador.nombres} ${jugador.apellidos}`}
    >
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <div className="relative aspect-square bg-gray-100">
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