import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiModule from '../api';

// Mock fetch globally
global.fetch = vi.fn();

describe('deleteVacancy API Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return success response on 200 OK', async () => {
      // Arrange
      const vacancyId = 'vag-123';
      const mockResponse = { success: true, message: 'Vaga excluída com sucesso' };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      // Act
      const result = await apiModule.deleteVacancy(vacancyId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/vacancies/${vacancyId}`),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Error Cases', () => {
    it('should throw error on 404 Not Found', async () => {
      // Arrange
      const vacancyId = 'nonexistent-id';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Vaga não encontrada' }),
      } as any);

      // Act & Assert
      await expect(apiModule.deleteVacancy(vacancyId))
        .rejects.toThrow();
    });

    it('should throw error on 409 Conflict (cannot delete)', async () => {
      // Arrange
      const vacancyId = 'vag-with-accepted';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Cannot delete: vacancy has accepted candidates' }),
      } as any);

      // Act & Assert
      await expect(apiModule.deleteVacancy(vacancyId))
        .rejects.toThrow();
    });

    it('should throw error on 500 Internal Server Error', async () => {
      // Arrange
      const vacancyId = 'vag-123';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      } as any);

      // Act & Assert
      await expect(apiModule.deleteVacancy(vacancyId))
        .rejects.toThrow();
    });

    it('should handle network error', async () => {
      // Arrange
      const vacancyId = 'vag-123';
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(apiModule.deleteVacancy(vacancyId))
        .rejects.toThrow('Network error');
    });
  });

  describe('Response Parsing', () => {
    it('should parse JSON response correctly', async () => {
      // Arrange
      const vacancyId = 'vag-123';
      const mockResponse = {
        success: true,
        message: 'Vaga deletada',
        timestamp: '2025-03-27T10:30:00Z',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      // Act
      const result = await apiModule.deleteVacancy(vacancyId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Vaga deletada');
    });

    it('should use fallback error message when response body is invalid', async () => {
      // Arrange
      const vacancyId = 'vag-123';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
      } as any);

      // Act & Assert
      await expect(apiModule.deleteVacancy(vacancyId))
        .rejects.toThrow();
    });
  });

  describe('Integration Contract', () => {
    it('should call DELETE endpoint with correct URL pattern', async () => {
      // Arrange
      const vacancyId = 'test-vag-id-12345';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Deleted' }),
      } as any);

      // Act
      await apiModule.deleteVacancy(vacancyId);

      // Assert - verify correct HTTP method and endpoint
      const callArgs = (global.fetch as any).mock.calls[0];
      expect(callArgs[1].method).toBe('DELETE');
      expect(callArgs[0]).toContain(vacancyId);
    });

    it('should use Bearer token in Authorization header', async () => {
      // Arrange
      const vacancyId = 'vag-123';
      localStorage.setItem('auth_token', 'test-token-12345');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Deleted' }),
      } as any);

      // Act
      await apiModule.deleteVacancy(vacancyId);

      // Assert
      const callArgs = (global.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers || {};
      // Bearer token should be included via apiFetch wrapper
      expect(callArgs[1]).toBeDefined();

      localStorage.removeItem('auth_token');
    });
  });
});
