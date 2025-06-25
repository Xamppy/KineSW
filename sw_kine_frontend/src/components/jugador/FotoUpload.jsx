import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { uploadFotoJugador } from '../../services/api';

const FotoUpload = ({ jugadorId, onUploadSuccess, className = '' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccione un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Crear FormData
      const formData = new FormData();
      formData.append('foto_perfil', file);

      // Subir la foto
      const response = await uploadFotoJugador(jugadorId, formData);

      // Crear URL temporal para preview
      const previewUrl = URL.createObjectURL(file);
      onUploadSuccess(previewUrl);

    } catch (err) {
      console.error('Error al subir la foto:', err);
      setError('Error al subir la foto. Por favor, intente nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      <label className="block">
        <span className="sr-only">Seleccionar foto de perfil</span>
        <div
          className={`
            relative flex items-center justify-center
            px-6 py-4 border-2 border-dashed rounded-lg
            transition-colors cursor-pointer
            ${isUploading ? 'bg-gray-50 border-gray-300' : 'hover:bg-gray-50 border-gray-300 hover:border-wanderers-green'}
          `}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
          <div className="text-center">
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-wanderers-green border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-gray-500">Subiendo foto...</span>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-wanderers-green hover:text-wanderers-green/80">
                    Seleccionar archivo
                  </span>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

FotoUpload.propTypes = {
  jugadorId: PropTypes.number.isRequired,
  onUploadSuccess: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default FotoUpload; 