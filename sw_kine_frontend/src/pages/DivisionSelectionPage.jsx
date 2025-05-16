import React, { useState, useEffect } from 'react';
import { getDivisiones } from '../services/api';

const DivisionSelectionPage = () => {
  // Estados
  const [divisiones, setDivisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar divisiones al montar el componente
  useEffect(() => {
    const fetchDivisiones = async () => {
      try {
        setLoading(true);
        const response = await getDivisiones();
        setDivisiones(response.results || response);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar divisiones:', err);
        setError('No se pudieron cargar las divisiones. Por favor, intenta nuevamente más tarde.');
        setLoading(false);
      }
    };

    fetchDivisiones();
  }, []);

  // Manejar clic en una división
  const handleDivisionClick = (divisionId) => {
    console.log('División seleccionada:', divisionId);
  };

  // Renderizar mensaje de carga
  if (loading) {
    return (
      <div className="p-4 bg-white shadow rounded flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wanderers-green border-e-transparent align-[-0.125em] me-2"></div>
          <span className="text-xl">Cargando divisiones...</span>
        </div>
      </div>
    );
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <div className="p-4 bg-white shadow rounded">
        <div className="bg-red-100 border-s-4 border-red-500 p-4 text-red-700 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button 
          className="bg-wanderers-green hover:bg-opacity-90 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar lista de divisiones
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold text-wanderers-green mb-4">Selección de División</h2>
      
      {divisiones.length === 0 ? (
        <p className="text-gray-500 italic">No se encontraron divisiones disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisiones.map((division) => (
            <button
              key={division.id}
              onClick={() => handleDivisionClick(division.id)}
              className="
                bg-wanderers-green text-wanderers-white 
                hover:bg-opacity-90 transition-colors
                p-6 rounded-lg shadow-md
                flex flex-col items-center justify-center
                min-h-[120px]
              "
            >
              <span className="text-lg font-bold mb-2">{division.nombre}</span>
              {division.jugadores_count && (
                <span className="text-sm bg-wanderers-white text-wanderers-green px-2 py-1 rounded-full">
                  {division.jugadores_count} jugadores
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DivisionSelectionPage; 