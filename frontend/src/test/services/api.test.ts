import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient as api } from '../../services/api';

// Mock global fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock performance
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => 0),
  },
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('GET requests', () => {
    it('realiza una petición GET exitosa', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await api.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('agrega parámetros a la URL', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await api.get('/test', { filter: 'active', page: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('filter=active'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('realiza una petición POST exitosa', async () => {
      const mockData = { id: 1, name: 'Created' };
      const postData = { name: 'New Item' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await api.post('/test', postData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('PUT requests', () => {
    it('realiza una petición PUT exitosa', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const putData = { name: 'Updated Item' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await api.put('/test/1', putData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(putData),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('realiza una petición DELETE exitosa', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await api.delete('/test/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('maneja respuestas 204 No Content', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await api.delete('/test/1');

      expect(result).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('lanza error cuando la respuesta no es ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Not found' }),
      });

      await expect(api.get('/test')).rejects.toThrow('Not found');
    });

    it('lanza error genérico cuando no hay detail', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(api.get('/test')).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('Headers', () => {
    it('usa Headers object para las peticiones', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await api.get('/test');

      // El servicio ahora usa new Headers() que establece Content-Type internamente
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });
  });
});
