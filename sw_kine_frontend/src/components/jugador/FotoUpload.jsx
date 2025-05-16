import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';

const FotoUpload = ({ jugadorId, currentFotoUrl, onUploadSuccess }) => {
  const { isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor seleccione un archivo de imagen válido.');
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB.');
        return;
      }
      setSelectedFile(file);
      // Crear preview de la imagen seleccionada
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para subir fotos.');
      return;
    }

    if (!selectedFile) {
      setError('Por favor seleccione una imagen primero.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('foto_perfil', selectedFile);

      const { uploadFotoJugador } = await import('../../services/api');
      const response = await uploadFotoJugador(jugadorId, formData);

      // Limpiar el estado
      setSelectedFile(null);
      // Mantener la URL de preview hasta que se actualice la página
      if (onUploadSuccess) {
        onUploadSuccess(previewUrl); // Pasar la URL temporal al componente padre
      }
    } catch (err) {
      console.error('Error uploading photo:', err.response?.data || err);
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      } else if (err.response?.status === 404) {
        setError('No se encontró el jugador. Por favor, actualice la página.');
      } else if (err.message === 'Jugador no encontrado') {
        setError('No se encontró el jugador en los datos simulados.');
      } else {
        setError(err.response?.data?.detail || 'Error al subir la imagen. Por favor intente nuevamente.');
      }
      // Limpiar la preview en caso de error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Limpiar la URL del objeto al desmontar el componente
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="relative cursor-pointer">
          <span className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-bold text-white bg-[#00693E] hover:bg-[#00693E]/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#00693E]">
            Seleccionar Imagen
          </span>
          <input
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
        {selectedFile && (
          <span className="text-sm text-gray-600">
            {selectedFile.name}
          </span>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        className={`w-full px-4 py-2 rounded-md shadow-sm text-sm font-bold text-white 
          ${isUploading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#00693E] hover:bg-[#00693E]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00693E]'}`}
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? 'Subiendo...' : 'Subir Foto'}
      </button>
    </div>
  );
};

FotoUpload.propTypes = {
  jugadorId: PropTypes.number.isRequired,
  currentFotoUrl: PropTypes.string,
  onUploadSuccess: PropTypes.func
};

export default FotoUpload; 