import React, { useState, useMemo } from 'react';

const HistorialLesionGraph = ({ historial = [], diasMostrar = 90 }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Ordenar los datos del historial por fecha de más antigua a más reciente
  const historialOrdenado = useMemo(() => {
    return [...historial].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [historial]);

  // Obtener color según el estado
  const getColorPorEstado = (estado) => {
    if (estado === 'camilla') return 'bg-red-500';
    if (estado === 'gimnasio') return 'bg-yellow-500';
    if (estado === 'reintegro') return 'bg-green-500';
    return 'bg-gray-300';
  };

  // Obtener texto legible del estado
  const getTextoEstado = (estado) => {
    switch (estado) {
      case 'camilla':
        return 'Tratamiento en Camilla';
      case 'gimnasio':
        return 'Tratamiento en Gimnasio';
      case 'reintegro':
        return 'Reintegro Deportivo';
      default:
        return 'Sin registro';
    }
  };

  // Formatear fecha para mostrar
  const formatearFechaLegible = (fecha) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear fecha en formato DD-MM-YYYY
  const formatearFechaCorta = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calcular estadísticas para la leyenda
  const estadisticas = useMemo(() => {
    const stats = {
      total: historialOrdenado.length,
      camilla: 0,
      gimnasio: 0,
      reintegro: 0
    };

    historialOrdenado.forEach(entry => {
      if (stats[entry.estado] !== undefined) {
        stats[entry.estado]++;
      }
    });

    return stats;
  }, [historialOrdenado]);

  return (
    <div className="w-full">
      {/* Header con estadísticas */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Historial de Tratamiento ({historialOrdenado.length} registros)
        </h4>
        
        {estadisticas.total > 0 && (
          <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
              <span>Camilla: {estadisticas.camilla}</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
              <span>Gimnasio: {estadisticas.gimnasio}</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
              <span>Reintegro: {estadisticas.reintegro}</span>
            </span>
          </div>
        )}
      </div>

      {/* Contenedor horizontal con los cuadrados */}
      {historialOrdenado.length > 0 ? (
        <div className="flex flex-row flex-wrap gap-1 p-2 border border-gray-300 rounded-md bg-white">
          {historialOrdenado.map((item, index) => (
            <div
              key={`${item.fecha}-${index}`}
              className={`w-4 h-4 rounded-sm ${getColorPorEstado(item.estado)} hover:scale-110 transition-transform duration-200 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-400`}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center p-8 border border-gray-300 rounded-md bg-gray-50">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No hay registros de tratamiento disponibles</p>
          </div>
        </div>
      )}

      {/* Tooltip mejorado */}
      {hoveredItem && (
        <div className="mt-4 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
          <div className="font-medium">
            {formatearFechaLegible(hoveredItem.fecha)}
          </div>
          <div className="text-gray-300 mt-1">
            {getTextoEstado(hoveredItem.estado)}
          </div>
          {hoveredItem.observaciones && (
            <div className="text-gray-400 mt-2 text-xs italic">
              "{hoveredItem.observaciones}"
            </div>
          )}
          {hoveredItem.registrado_por_nombre && (
            <div className="text-gray-400 mt-1 text-xs">
              Registrado por: {hoveredItem.registrado_por_nombre}
            </div>
          )}
        </div>
      )}

      {/* Información adicional si hay datos */}
      {historialOrdenado.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          <p>
            Desde <span className="font-medium">{formatearFechaCorta(historialOrdenado[0]?.fecha)}</span> hasta{' '}
            <span className="font-medium">{formatearFechaCorta(historialOrdenado[historialOrdenado.length - 1]?.fecha)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default HistorialLesionGraph; 