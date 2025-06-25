import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const ImageEditor = ({ imageUrl, onSave, onCancel, isOpen }) => {
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); // Posición en porcentaje
  const [imageScale, setImageScale] = useState(1); // Escala de zoom
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Manejar inicio del arrastre
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: imagePosition.x,
      startY: imagePosition.y
    });
  }, [imagePosition]);

  // Manejar movimiento del mouse
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convertir el delta a porcentaje
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = -(deltaY / rect.height) * 100; // Invertir Y para comportamiento natural

    // Calcular nueva posición
    const newX = dragStart.startX + deltaXPercent;
    const newY = dragStart.startY + deltaYPercent;

    // Limitar la posición dentro del contenedor
    setImagePosition({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY))
    });
  }, [isDragging, dragStart]);

  // Terminar arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Agregar event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Manejar zoom
  const handleZoomChange = (e) => {
    setImageScale(parseFloat(e.target.value));
  };

  // Resetear posición
  const handleReset = () => {
    setImagePosition({ x: 50, y: 50 });
    setImageScale(1);
  };

  // Guardar configuración
  const handleSave = () => {
    onSave({
      position: imagePosition,
      scale: imageScale
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Editar Posición de la Imagen
        </h3>
        
        {/* Contenedor de previsualización */}
        <div className="mb-6">
          <div 
            ref={containerRef}
            className="relative w-80 h-80 mx-auto bg-gray-100 rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
          >
            <img
              src={imageUrl}
              alt="Vista previa"
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${imageScale})`,
                objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              draggable={false}
            />
            
            {/* Overlay para indicar área de arrastre */}
            <div className="absolute inset-0 bg-transparent">
              <div className="absolute inset-4 border-2 border-white border-dashed opacity-50"></div>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-sm text-gray-500 mb-1">
              Arrastra la imagen para reposicionarla
            </p>
            <p className="text-xs text-gray-400">
              Usa los controles de abajo para ajustes precisos
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-4 mb-6">
          {/* Control de zoom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {imageScale.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={imageScale}
              onChange={handleZoomChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

                     {/* Controles de posición fina */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posición Horizontal: {imagePosition.x.toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={imagePosition.x}
                onChange={(e) => setImagePosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Izquierda</span>
                <span>Derecha</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posición Vertical: {imagePosition.y.toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={imagePosition.y}
                onChange={(e) => setImagePosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Arriba</span>
                <span>Abajo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Resetear
          </button>
          
          <div className="space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-wanderers-green text-white rounded-md hover:bg-wanderers-green/90"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ImageEditor.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default ImageEditor; 