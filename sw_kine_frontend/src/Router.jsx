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
        {/* Nueva ruta para Checklist Post-Partido */}
        <Route path="checklist-post-partido">
          <Route path="nuevo" element={
            <ProtectedRoute>
              <AddChecklistPage />
            </ProtectedRoute>
          } />
        </Route>
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