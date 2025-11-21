/**
 * API Service
 * Cliente HTTP para consumir endpoints del backend
 */
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const method = fetchOptions.method || 'GET';
    
    const url = this.buildUrl(endpoint, params);
    
    // Log request
    logger.api(method, endpoint, {
      params,
      body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
    });
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers || {}),
    };

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: defaultHeaders,
      });

      const duration = performance.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        
        logger.apiError(method, endpoint, {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        
        throw error;
      }

      const data = await response.json();
      
      // Log successful response
      logger.apiResponse(method, endpoint, response.status, {
        dataSize: JSON.stringify(data).length,
        duration: `${duration.toFixed(2)}ms`,
      });
      
      // Log performance if slow
      if (duration > 1000) {
        logger.performance(`API ${method} ${endpoint}`, duration);
      }

      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      if (error instanceof Error && !error.message.includes('HTTP error!')) {
        // Network error or other fetch error
        logger.apiError(method, endpoint, {
          message: error.message,
          duration: `${duration.toFixed(2)}ms`,
        });
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('archivo', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    const url = this.buildUrl(endpoint);
    
    logger.api('POST', endpoint, {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)}KB`,
      fileType: file.type,
      additionalData,
    });
    
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // No incluir Content-Type header, el navegador lo establece automáticamente con el boundary
      });

      const duration = performance.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        logger.apiError('POST', endpoint, {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      logger.apiResponse('POST', endpoint, response.status, {
        duration: `${duration.toFixed(2)}ms`,
      });

      return data;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      if (error instanceof Error && !error.message.includes('HTTP error!')) {
        logger.apiError('POST', endpoint, {
          message: error.message,
          duration: `${duration.toFixed(2)}ms`,
        });
      }
      
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
