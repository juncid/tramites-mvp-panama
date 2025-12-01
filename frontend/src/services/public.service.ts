import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface IniciarSolicitudRequest {
  pasaporte: string;
  nombres: string;
  apellidos: string;
  email?: string;
  nacionalidad?: string;
  sexo?: string;
  fecha_nacimiento?: string;  // formato YYYY-MM-DD
}

export interface IniciarSolicitudResponse {
  success: boolean;
  instancia_id: number;
  solicitud_id: number;
  token: string;
  codigo_acceso?: string;  // Optional access code for easy access
  num_expediente: string;
  link_seguimiento: string;
  mensaje: string;
}

export interface ValidarTokenResponse {
  valid: boolean;
  instancia_id?: number;
  num_expediente?: string;
  estado?: string;
  etapa_actual?: string;
}

export interface InstanciaPublicaResponse {
  id: number;
  workflow_id: number;
  num_expediente: string;
  nombre_instancia: string;
  estado: string;
  etapa_actual_id: number;
  metadata_adicional: any;
  workflow?: any;
  etapa_actual?: any;
}

class PublicService {
  /**
   * Inicia una nueva solicitud PPSH sin autenticación
   */
  async iniciarSolicitud(data: IniciarSolicitudRequest): Promise<IniciarSolicitudResponse> {
    const response = await axios.post(`${API_URL}/public/solicitudes/iniciar`, data);
    return response.data;
  }

  /**
   * Valida un token de acceso público
   */
  async validarToken(token: string): Promise<ValidarTokenResponse> {
    const response = await axios.get(`${API_URL}/public/solicitudes/${token}/validar`);
    return response.data;
  }

  /**
   * Obtiene los datos de una instancia usando un token público
   */
  async getInstanciaPorToken(token: string): Promise<InstanciaPublicaResponse> {
    const response = await axios.get(`${API_URL}/public/solicitudes/${token}/instancia`);
    return response.data;
  }

  /**
   * Obtiene datos básicos de la instancia (sin validar permisos de etapa)
   * Es el mismo endpoint pero usado en contexto de modo seguimiento
   */
  async getInstanciaBasica(token: string): Promise<InstanciaPublicaResponse | null> {
    try {
      const response = await axios.get(`${API_URL}/public/solicitudes/${token}/instancia`);
      return response.data;
    } catch (error) {
      console.error('Error getting instancia basica:', error);
      return null;
    }
  }
}

export const publicService = new PublicService();
