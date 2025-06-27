import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { canWrite } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Fondo con ondulación en verde institucional */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 left-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: '40%' }}
        >
          <path
            fill="#07421a"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <h1 className="text-3xl font-bold text-wanderers-green mb-8">
          Dashboard Kinesiología
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fichas Clínicas */}
          <Link
            to="/ficha-clinica"
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-wanderers-green">Fichas Clínicas</h2>
              <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600">Gestionar fichas clínicas de los jugadores</p>
          </Link>

          {/* Atenciones Kinésicas */}
          <Link
            to="/atenciones-kinesicas"
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-wanderers-green">Atenciones Kinésicas</h2>
              <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600">Gestionar atenciones kinésicas de los jugadores</p>
          </Link>

          {/* Partidos y Checklists - Solo para usuarios con permisos de escritura */}
          {canWrite() && (
            <Link
              to="/partidos"
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-wanderers-green">Partidos y Checklists</h2>
                <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4V5m6 0v6m-6 6v-6m6 6v-6m-6 0h6m-6 0V11m6 4v2a2 2 0 01-2 2H10a2 2 0 01-2-2v-2" />
                </svg>
              </div>
              <p className="text-gray-600">Gestionar partidos, convocatorias y checklists post-partido</p>
            </Link>
          )}

          {/* Gestión de Lesiones - Solo para usuarios con permisos de escritura */}
          {canWrite() && (
            <Link
              to="/lesiones"
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-wanderers-green">Gestión de Lesiones</h2>
                <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 1112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-gray-600">Registrar y gestionar lesiones de los jugadores</p>
            </Link>
          )}

          {/* Estado de Lesión - Solo para usuarios con permisos de escritura */}
          {canWrite() && (
            <Link
              to="/estado-lesion"
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-wanderers-green">Estado de Lesión</h2>
                <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 13h6m-3-3v6" />
                </svg>
              </div>
              <p className="text-gray-600">Ver estado actual de lesiones de los jugadores</p>
            </Link>
          )}

          {/* Historial de Lesiones */}
          <Link
            to="/historial-lesiones"
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-wanderers-green">Historial de Lesiones</h2>
              <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-600">Ver historial completo de lesiones por jugador</p>
          </Link>

          {/* Historial Checklists Post-Partido */}
          <Link
            to="/historial-checklists"
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-wanderers-green">Historial Checklists Post-Partido</h2>
              <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">Ver historial completo de checklists post-partido</p>
          </Link>

          {/* Divisiones */}
          <Link
            to="/divisiones"
            className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-wanderers-green">Divisiones</h2>
              <svg className="w-6 h-6 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600">Ver jugadores por división</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 