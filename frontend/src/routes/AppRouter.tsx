import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { Tramites } from '../pages/Tramites';
import { Solicitudes } from '../pages/Solicitudes';
import { RevisionRequisitos } from '../pages/RevisionRequisitos';
import { Etapas } from '../pages/Etapas';
import { Procesos } from '../pages/Procesos';
import { WorkflowEditor } from '../pages/WorkflowEditor';
import { WorkflowEditorFigma } from '../pages/WorkflowEditorFigma';
import { CargaDocumentosPPSH } from '../pages/CargaDocumentosPPSH';
import { DetalleProcesoPPSH } from '../pages/DetalleProcesoPPSH';
import { TestVisa } from '../pages/TestVisa';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import PublicAccess from '../pages/PublicAccess';
import PublicSolicitudView from '../pages/PublicSolicitudView';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas públicas SIN layout */}
      <Route path="/acceso-publico" element={<PublicAccess />} />
      <Route path="/consulta-publica/:numeroSolicitud" element={<PublicSolicitudView />} />

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
            <Procesos />
          </MainLayout>
        }
      />
      <Route
        path="/flujos"
        element={
          <MainLayout>
            <Procesos />
          </MainLayout>
        }
      />
      {/* Rutas de workflows - deben ir ANTES de /procesos/:id */}
      <Route
        path="/flujos/nuevo"
        element={
          <MainLayout>
            <WorkflowEditor />
          </MainLayout>
        }
      />
      <Route
        path="/flujos/:id/editar"
        element={
          <MainLayout>
            <WorkflowEditor />
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
      <Route
        path="/procesos/:procesoId/solicitud/:solicitudId/documentos"
        element={
          <MainLayout>
            <CargaDocumentosPPSH />
          </MainLayout>
        }
      />
      <Route
        path="/procesos/:procesoId/solicitud/:solicitudId"
        element={
          <MainLayout>
            <DetalleProcesoPPSH />
          </MainLayout>
        }
      />
      <Route
        path="/test-visa"
        element={
          <MainLayout>
            <TestVisa />
          </MainLayout>
        }
      />
      <Route
        path="/workflow-editor-figma"
        element={
          <MainLayout>
            <WorkflowEditorFigma />
          </MainLayout>
        }
      />
      <Route
        path="/perfil"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />
      <Route
        path="/configuracion"
        element={
          <MainLayout>
            <Settings />
          </MainLayout>
        }
      />

      {/* Redirección de rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
