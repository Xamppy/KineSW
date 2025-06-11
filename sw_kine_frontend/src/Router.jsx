import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FichaClinicaGeneralPage from './pages/FichaClinicaGeneralPage';
import JugadorDetailPage from './pages/JugadorDetailPage';
import AddPlayerPage from './pages/AddPlayerPage';
import AddChecklistPage from './pages/AddChecklistPage';
import DivisionSelectionPage from './pages/DivisionSelectionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AtencionesPage from './pages/AtencionesPage';
import EstadoLesionPage from './pages/EstadoLesionPage';
import LesionesPage from './pages/LesionesPage';
import NuevaLesionPage from './pages/NuevaLesionPage';
import HistorialLesionesPage from './pages/HistorialLesionesPage';
import HistorialChecklistsPage from './pages/HistorialChecklistsPage';
import PartidosListPage from './pages/PartidosListPage';
import GestionarConvocatoriaPage from './pages/GestionarConvocatoriaPage';
import RealizarChecklistPage from './pages/RealizarChecklistPage';
import ProtectedRoute from './components/ProtectedRoute';

const Router = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas protegidas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="divisiones" element={
          <ProtectedRoute>
            <DivisionSelectionPage />
          </ProtectedRoute>
        } />
        <Route path="ficha-clinica">
          <Route index element={
            <ProtectedRoute>
              <FichaClinicaGeneralPage />
            </ProtectedRoute>
          } />
          <Route path="jugador/nuevo" element={
            <ProtectedRoute>
              <AddPlayerPage />
            </ProtectedRoute>
          } />
          <Route path="jugador/:jugadorId" element={
            <ProtectedRoute>
              <JugadorDetailPage />
            </ProtectedRoute>
          } />
        </Route>
        {/* Nueva ruta para Atenciones Kinésicas */}
        <Route path="atenciones-kinesicas" element={
          <ProtectedRoute>
            <AtencionesPage />
          </ProtectedRoute>
        } />
        {/* Nueva ruta para Partidos y Checklists */}
        <Route path="partidos">
          <Route index element={
            <ProtectedRoute>
              <PartidosListPage />
            </ProtectedRoute>
          } />
          <Route path=":partidoId/convocatoria" element={
            <ProtectedRoute>
              <GestionarConvocatoriaPage />
            </ProtectedRoute>
          } />
          <Route path=":partidoId/checklist" element={
            <ProtectedRoute>
              <RealizarChecklistPage />
            </ProtectedRoute>
          } />
        </Route>
        {/* Nueva ruta para Checklist Post-Partido (mantener para compatibilidad) */}
        <Route path="checklist-post-partido">
          <Route path="nuevo" element={
            <ProtectedRoute>
              <AddChecklistPage />
            </ProtectedRoute>
          } />
        </Route>
        {/* Nueva ruta para Estado de Lesión */}
        <Route path="estado-lesion" element={
          <ProtectedRoute>
            <EstadoLesionPage />
          </ProtectedRoute>
        } />
        {/* Nueva ruta para Gestión de Lesiones */}
        <Route path="lesiones" element={
          <ProtectedRoute>
            <LesionesPage />
          </ProtectedRoute>
        } />
        {/* Nueva ruta para Registrar Nueva Lesión */}
        <Route path="lesiones/nueva" element={
          <ProtectedRoute>
            <NuevaLesionPage />
          </ProtectedRoute>
        } />
        {/* Nueva ruta para Historial de Lesiones */}
        <Route path="historial-lesiones" element={
          <ProtectedRoute>
            <HistorialLesionesPage />
          </ProtectedRoute>
        } />
        {/* Nueva ruta para Historial de Checklists */}
        <Route path="historial-checklists" element={
          <ProtectedRoute>
            <HistorialChecklistsPage />
          </ProtectedRoute>
        } />
        {/* Ruta 404 */}
        <Route path="*" element={
          <div className="p-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <p className="font-bold">Página no encontrada</p>
              <p>La ruta solicitada no existe.</p>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
};

export default Router; 