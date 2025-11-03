import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { Tramites } from '../pages/Tramites';
import { Solicitudes } from '../pages/Solicitudes';
import { ProcesosList } from '../pages/ProcesosList';
import { RevisionRequisitos } from '../pages/RevisionRequisitos';
import { Etapas } from '../pages/Etapas';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas con layout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes"
        element={
          <MainLayout>
            <Solicitudes />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/revision"
        element={
          <MainLayout>
            <RevisionRequisitos />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/etapas"
        element={
          <MainLayout>
            <Etapas />
          </MainLayout>
        }
      />
      <Route
        path="/procesos"
        element={
          <MainLayout>
            <ProcesosList />
          </MainLayout>
        }
      />
      <Route
        path="/procesos/:id"
        element={
          <MainLayout>
            <Tramites />
          </MainLayout>
        }
      />

      {/* Redirección de rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
