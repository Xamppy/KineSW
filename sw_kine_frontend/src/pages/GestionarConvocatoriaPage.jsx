import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJugadores, getPartidoById, updateConvocatoria } from '../services/api';

const GestionarConvocatoriaPage = () => {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  
  const [partido, setPartido] = useState(null);
  const [todosLosJugadores, setTodosLosJugadores] = useState([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);
  const [convocados, setConvocados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [partidoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar partido y jugadores en paralelo
      const [partidoData, jugadoresData] = await Promise.all([
        getPartidoById(partidoId),
        getJugadores({ activo: true })
      ]);
      
      setPartido(partidoData);
      setTodosLosJugadores(jugadoresData);
      
      // Separar jugadores ya convocados de los disponibles
      const convocadosIds = partidoData.convocados || [];
      const convocadosDetalle = partidoData.convocados_detalle || 
        jugadoresData.filter(j => convocadosIds.includes(j.id));
      
      setConvocados(convocadosDetalle);
      setJugadoresDisponibles(
        jugadoresData.filter(j => !convocadosIds.includes(j.id))
      );
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del partido');
    } finally {
      setLoading(false);
    }
  };

  const convocarJugador = (jugador) => {
    if (convocados.length >= 22) {
      alert('No se pueden convocar más de 22 jugadores');
      return;
    }
    
    setConvocados(prev => [...prev, jugador]);
    setJugadoresDisponibles(prev => prev.filter(j => j.id !== jugador.id));
  };

  const quitarConvocatoria = (jugador) => {
    setConvocados(prev => prev.filter(j => j.id !== jugador.id));
    setJugadoresDisponibles(prev => [...prev, jugador].sort((a, b) => 
      a.apellidos.localeCompare(b.apellidos)
    ));
  };

  const guardarConvocatoria = async () => {
    try {
      setSaving(true);
      
      const jugadoresIds = convocados.map(j => j.id);
      await updateConvocatoria(partidoId, jugadoresIds);
      
      alert('Convocatoria guardada exitosamente');
      navigate('/partidos');
      
    } catch (err) {
      console.error('Error al guardar convocatoria:', err);
      alert('Error al guardar la convocatoria. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const jugadoresFiltrados = jugadoresDisponibles.filter(jugador =>
    `${jugador.nombres} ${jugador.apellidos}`.toLowerCase().includes(filtroNombre.toLowerCase()) ||
    jugador.numero_ficha?.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wanderers-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/partidos')}
          className="text-wanderers-green hover:underline"
        >
          ← Volver a Partidos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/partidos')}
          className="text-wanderers-green hover:underline mb-4 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Partidos
        </button>
        
        <h1 className="text-3xl font-bold text-wanderers-green mb-2">
          Gestionar Convocatoria
        </h1>
        
        {partido && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              vs {partido.rival}
            </h2>
            <p className="text-gray-600">
              {partido.fecha_str || new Date(partido.fecha).toLocaleDateString('es-CL')} - {partido.condicion_display}
            </p>
          </div>
        )}
      </div>

      {/* Panel de convocatoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Panel Izquierdo - Jugadores Disponibles */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Jugadores Disponibles ({jugadoresFiltrados.length})
            </h3>
            
            {/* Filtro de búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o número de ficha..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wanderers-green"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {jugadoresFiltrados.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {filtroNombre ? 'No se encontraron jugadores con ese criterio' : 'No hay jugadores disponibles'}
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {jugadoresFiltrados.map((jugador) => (
                  <div
                    key={jugador.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => convocarJugador(jugador)}
                  >
                    <div className="flex items-center space-x-3">
                      {jugador.foto_perfil_url && (
                        <img
                          src={jugador.foto_perfil_url}
                          alt={`${jugador.nombres} ${jugador.apellidos}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {jugador.nombres} {jugador.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">
                          #{jugador.numero_ficha} - {jugador.division_nombre}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        convocarJugador(jugador);
                      }}
                      disabled={convocados.length >= 22}
                      className="text-wanderers-green hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho - Convocados */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Convocados ({convocados.length}/22)
            </h3>
            
            {/* Indicador de estado */}
            <div className="flex items-center">
              <div className={`w-full bg-gray-200 rounded-full h-2 ${convocados.length > 22 ? 'bg-red-200' : ''}`}>
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    convocados.length === 22 ? 'bg-green-500' :
                    convocados.length > 22 ? 'bg-red-500' :
                    'bg-wanderers-green'
                  }`}
                  style={{ width: `${Math.min((convocados.length / 22) * 100, 100)}%` }}
                ></div>
              </div>
              <span className={`ml-2 text-sm ${
                convocados.length === 22 ? 'text-green-600' :
                convocados.length > 22 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {convocados.length}/22
              </span>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {convocados.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Selecciona jugadores del panel izquierdo
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {convocados.map((jugador, index) => (
                  <div
                    key={jugador.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-wanderers-green text-white text-xs rounded-full">
                        {index + 1}
                      </span>
                      {jugador.foto_perfil_url && (
                        <img
                          src={jugador.foto_perfil_url}
                          alt={`${jugador.nombres} ${jugador.apellidos}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {jugador.nombres} {jugador.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">
                          #{jugador.numero_ficha} - {jugador.division_nombre}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => quitarConvocatoria(jugador)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {convocados.length === 0 && "Selecciona al menos un jugador para guardar la convocatoria"}
          {convocados.length > 0 && convocados.length < 22 && `Faltan ${22 - convocados.length} jugadores para completar la convocatoria`}
          {convocados.length === 22 && "✅ Convocatoria completa (22 jugadores)"}
          {convocados.length > 22 && "⚠️ Excede el límite máximo de 22 jugadores"}
        </div>
        
        <button
          onClick={guardarConvocatoria}
          disabled={convocados.length === 0 || saving}
          className="bg-wanderers-green text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Guardar Convocatoria
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GestionarConvocatoriaPage; 