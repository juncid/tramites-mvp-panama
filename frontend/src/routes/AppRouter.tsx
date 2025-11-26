import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { PublicLayout } from '../components/Layout/PublicLayout';
import { Dashboard } from '../pages/Dashboard';
import { Tramites } from '../pages/Tramites';
import { Solicitudes } from '../pages/Solicitudes';
import { RevisionRequisitos } from '../pages/RevisionRequisitos';
import { Procesos } from '../pages/Procesos';
import { WorkflowEditor } from '../pages/WorkflowEditor';
import { WorkflowViewer } from '../pages/WorkflowViewer';
import { WorkflowEditorFigma } from '../pages/WorkflowEditorFigma';
import { ComponentComparison } from '../pages/ComponentComparison';
import { CargaDocumentosPPSH } from '../pages/CargaDocumentosPPSH';
import { DetalleProcesoPPSH } from '../pages/DetalleProcesoPPSH';
import { ProcesoEjecucion } from '../pages/ProcesoEjecucion';
import { EtapaExecution } from '../pages/EtapaExecution';
import { TestVisa } from '../pages/TestVisa';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import PublicAccess from '../pages/PublicAccess';
import PublicSolicitudView from '../pages/PublicSolicitudView';
import { MisTramitesPage } from '../pages/MisTramites';
import { CasoWorkflowPage } from '../pages/CasoWorkflow';
import { WorkflowExecution } from '../pages/WorkflowExecution';
import NuevaSolicitud from '../pages/NuevaSolicitud';
import SolicitudPublicaWorkflow from '../pages/SolicitudPublicaWorkflow';
import { WorkflowEtapas } from '../pages/WorkflowEtapas';
import { DescargaRequisitos } from '../pages/DescargaRequisitos';
import { CargaPoderGeneral } from '../pages/CargaPoderGeneral';
import { CargaSolicitudFirmada } from '../pages/CargaSolicitudFirmada';
import { Cotizacion } from '../pages/Cotizacion';
import { RecepcionRecibosPagos } from '../pages/RecepcionRecibosPagos';
import { ImpresionListaCasos } from '../pages/ImpresionListaCasos';
import { ReasignacionCaso } from '../pages/ReasignacionCaso';
import { ProgramacionEntrevista } from '../pages/ProgramacionEntrevista';
import { RecepcionRex } from '../pages/RecepcionRex';
import { RecepcionReciboTesoreria } from '../pages/RecepcionReciboTesoreria';
import { NotasEntrevista } from '../pages/NotasEntrevista';
import { DictamenFinal } from '../pages/DictamenFinal';
import { EntregaResolucion } from '../pages/EntregaResolucion';
import { InicioTramite } from '../pages/InicioTramite';
import WorkflowEtapasPublico from '../pages/WorkflowEtapasPublico';
import { GenericEtapaPage } from '../pages/GenericEtapaPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Página de inicio de trámite (pública, sin layout) */}
      <Route path="/inicio" element={<InicioTramite />} />
      
      {/* Rutas públicas CON layout */}
      <Route path="/acceso-publico" element={<MainLayout><PublicAccess /></MainLayout>} />
      <Route path="/consulta-publica/:numeroSolicitud" element={<MainLayout><PublicSolicitudView /></MainLayout>} />
      
      {/* Nuevas rutas públicas para solicitudes PPSH */}
      <Route path="/solicitudes/nueva" element={<MainLayout><NuevaSolicitud /></MainLayout>} />
      <Route path="/solicitudes/:token/workflow" element={<PublicLayout><SolicitudPublicaWorkflow /></PublicLayout>} />
      {/* Ruta para ciudadanos con token JWT - WorkflowEtapasPublico detecta si es JWT o ID */}
      <Route path="/solicitudes/:token/etapas" element={<WorkflowEtapasPublico />} />
      <Route path="/solicitudes/:token/etapa/:etapaOrden" element={<PublicLayout><SolicitudPublicaWorkflow /></PublicLayout>} />

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
            <WorkflowEtapas />
          </MainLayout>
        }
      />
      {/* Ruta GENÉRICA para cualquier etapa de solicitud */}
      <Route
        path="/solicitudes/:id/etapa"
        element={
          <MainLayout>
            <GenericEtapaPage />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/descarga-requisitos"
        element={
          <MainLayout>
            <DescargaRequisitos />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/carga-poder"
        element={
          <MainLayout>
            <CargaPoderGeneral />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/execution"
        element={
          <MainLayout>
            <WorkflowExecution />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/carga-documentos"
        element={
          <MainLayout>
            <CargaSolicitudFirmada />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/cotizacion"
        element={
          <MainLayout>
            <Cotizacion />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/ingreso-datos"
        element={
          <MainLayout>
            <RecepcionRecibosPagos />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/impresion-lista"
        element={
          <MainLayout>
            <ImpresionListaCasos />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/reasignacion"
        element={
          <MainLayout>
            <ReasignacionCaso />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/recepcion-rex"
        element={
          <MainLayout>
            <RecepcionRex />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/recepcion-recibo-tesoreria"
        element={
          <MainLayout>
            <RecepcionReciboTesoreria />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/entrega-resolucion"
        element={
          <MainLayout>
            <EntregaResolucion />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/programacion-entrevista"
        element={
          <MainLayout>
            <ProgramacionEntrevista />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/notas-entrevista"
        element={
          <MainLayout>
            <NotasEntrevista />
          </MainLayout>
        }
      />
      <Route
        path="/solicitudes/:id/dictamen-final"
        element={
          <MainLayout>
            <DictamenFinal />
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
        path="/flujos/:id/editar-figma"
        element={
          <MainLayout>
            <WorkflowEditorFigma />
          </MainLayout>
        }
      />
      <Route
        path="/flujos/:id/ver"
        element={
          <MainLayout>
            <WorkflowViewer />
          </MainLayout>
        }
      />
      <Route
        path="/componentes-comparacion"
        element={
          <MainLayout>
            <ComponentComparison />
          </MainLayout>
        }
      />
      {/* Ruta de ejecución de workflows */}
      <Route
        path="/instancias/:instanciaId/ejecutar"
        element={
          <MainLayout>
            <ProcesoEjecucion />
          </MainLayout>
        }
      />
      {/* Ruta de ejecución de etapa específica con vistas dinámicas */}
      <Route
        path="/flujos/:workflowId/instancias/:instanciaId/etapa/:etapaId"
        element={
          <MainLayout>
            <EtapaExecution />
          </MainLayout>
        }
      />
      {/* Rutas de vistas por perfil - Mis Trámites y Workflow de Caso */}
      <Route
        path="/mis-tramites"
        element={
          <MainLayout>
            <MisTramitesPage />
          </MainLayout>
        }
      />
      <Route
        path="/casos/:instanciaId/workflow"
        element={
          <MainLayout>
            <CasoWorkflowPage />
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
      <Route
        path="/workflows/:instanciaId/execution"
        element={
          <MainLayout>
            <WorkflowExecution />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/etapas"
        element={
          <MainLayout>
            <WorkflowEtapas />
          </MainLayout>
        }
      />
      {/* 
        Ruta GENÉRICA para cualquier etapa - usa configuración del nodo dinámicamente
        Esta ruta debería reemplazar las rutas específicas por etapa
      */}
      <Route
        path="/workflows/:instanciaId/etapa"
        element={
          <MainLayout>
            <GenericEtapaPage />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/descarga-requisitos"
        element={
          <MainLayout>
            <DescargaRequisitos />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/carga-poder"
        element={
          <MainLayout>
            <CargaPoderGeneral />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/cotizacion"
        element={
          <MainLayout>
            <Cotizacion />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/ingreso-datos"
        element={
          <MainLayout>
            <RecepcionRecibosPagos />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/impresion-lista"
        element={
          <MainLayout>
            <ImpresionListaCasos />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/reasignacion"
        element={
          <MainLayout>
            <ReasignacionCaso />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/recepcion-rex"
        element={
          <MainLayout>
            <RecepcionRex />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/recepcion-recibo-tesoreria"
        element={
          <MainLayout>
            <RecepcionReciboTesoreria />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/entrega-resolucion"
        element={
          <MainLayout>
            <EntregaResolucion />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/programacion-entrevista"
        element={
          <MainLayout>
            <ProgramacionEntrevista />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/notas-entrevista"
        element={
          <MainLayout>
            <NotasEntrevista />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/dictamen-final"
        element={
          <MainLayout>
            <DictamenFinal />
          </MainLayout>
        }
      />
      <Route
        path="/workflows/:instanciaId/revision"
        element={
          <MainLayout>
            <Cotizacion />
          </MainLayout>
        }
      />

      {/* Redirección de rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
