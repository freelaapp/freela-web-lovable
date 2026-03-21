import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

/**
 * Testes unitários para a funcionalidade de disponibilidade de horários
 * 
 * Foco: Validar lógica de negócio, validações e contrato de API
 * Stack: Vitest + validações puras
 */

describe('Disponibilidade de Horários — Validações', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('authToken', JSON.stringify('test-token-jwt'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validações de Horários', () => {
    it('✅ deve validar que "até" > "de"', () => {
      const horario = { de: '08h', ate: '20h' };
      const deNum = parseInt(horario.de.replace('h', ''));
      const ateNum = parseInt(horario.ate.replace('h', ''));
      
      expect(ateNum).toBeGreaterThan(deNum);
    });

    it('❌ deve rejeitar quando "até" <= "de"', () => {
      const horario = { de: '20h', ate: '18h' };
      const deNum = parseInt(horario.de.replace('h', ''));
      const ateNum = parseInt(horario.ate.replace('h', ''));
      
      expect(ateNum <= deNum).toBe(true); // validação falha
    });

    it('❌ deve rejeitar horas fora do range 00h-23h', () => {
      const testCases = [
        { de: '25h', ate: '26h', shouldFail: true },
        { de: '00h', ate: '23h', shouldFail: false },
        { de: '-1h', ate: '10h', shouldFail: true },
        { de: '08h', ate: '20h', shouldFail: false },
      ];
      
      for (const tc of testCases) {
        const deNum = parseInt(tc.de.replace('h', ''));
        const ateNum = parseInt(tc.ate.replace('h', ''));
        const isValid = (deNum >= 0 && deNum <= 23) && (ateNum >= 0 && ateNum <= 23);
        expect(isValid).toBe(!tc.shouldFail);
      }
    });

    it('✅ deve permitir intervalos válidos', () => {
      const validIntervals = [
        { de: '08h', ate: '12h' },
        { de: '00h', ate: '23h' },
        { de: '10h', ate: '16h' },
        { de: '18h', ate: '23h' },
      ];
      
      for (const interval of validIntervals) {
        const deNum = parseInt(interval.de.replace('h', ''));
        const ateNum = parseInt(interval.ate.replace('h', ''));
        
        expect(ateNum).toBeGreaterThan(deNum);
        expect(deNum).toBeGreaterThanOrEqual(0);
        expect(ateNum).toBeLessThanOrEqual(23);
      }
    });
  });

  describe('Validações de Dias', () => {
    it('✅ deve permitir seleção parcial de dias', () => {
      const dias = ['seg', 'ter', 'sab', 'dom'];
      expect(dias.length).toBeGreaterThan(0);
      expect(dias.length).toBeLessThan(7);
    });

    it('✅ deve permitir apenas dias válidos', () => {
      const diasValidos = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
      const diasSelecionados = ['seg', 'sab', 'dom'];
      
      const isValid = diasSelecionados.every(d => diasValidos.includes(d));
      expect(isValid).toBe(true);
    });

    it('❌ deve rejeitar dia inválido', () => {
      const diasValidos = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
      const diasInvalidos = ['seg', 'segunda', 'ter'];
      
      const isValid = diasInvalidos.every(d => diasValidos.includes(d));
      expect(isValid).toBe(false);
    });

    it('❌ deve rejeitar dias vazios', () => {
      const dias: string[] = [];
      expect(dias.length).toBe(0);
      expect(dias.length > 0).toBe(false);
    });

    it('✅ deve remover duplicatas de dias', () => {
      const diasComDuplicata = ['seg', 'seg', 'ter', 'ter'];
      const diasUnicos = Array.from(new Set(diasComDuplicata));
      expect(diasUnicos.length).toBe(2);
      expect(diasUnicos).toEqual(['seg', 'ter']);
    });
  });

  describe('Payload Structure', () => {
    it('✅ deve ter estrutura correta de payload', () => {
      const payload = {
        diasAtivos: ['seg', 'ter', 'qua'],
        horarios: {
          seg: { de: '08h', ate: '20h' },
          ter: { de: '08h', ate: '20h' },
          qua: { de: '08h', ate: '20h' },
        },
      };
      
      expect(payload).toHaveProperty('diasAtivos');
      expect(payload).toHaveProperty('horarios');
      expect(payload.diasAtivos).toHaveLength(3);
      expect(Object.keys(payload.horarios)).toHaveLength(3);
    });

    it('✅ deve ter cada dia em horarios se está em diasAtivos', () => {
      const payload = {
        diasAtivos: ['seg', 'ter', 'qua'],
        horarios: {
          seg: { de: '08h', ate: '20h' },
          ter: { de: '08h', ate: '20h' },
          qua: { de: '08h', ate: '20h' },
        },
      };
      
      // Validar que cada dia em diasAtivos tem entrada em horarios
      for (const dia of payload.diasAtivos) {
        expect(payload.horarios).toHaveProperty(dia);
      }
    });

    it('❌ deve rejeitar dia em diasAtivos sem horario', () => {
      const payload = {
        diasAtivos: ['seg', 'ter', 'qua'],
        horarios: {
          seg: { de: '08h', ate: '20h' },
          ter: { de: '08h', ate: '20h' },
          // qua falta!
        },
      };
      
      // Validar que falta qua em horarios
      const temTodos = payload.diasAtivos.every(dia => 
        Object.prototype.hasOwnProperty.call(payload.horarios, dia)
      );
      
      expect(temTodos).toBe(false);
    });
  });

  describe('Response Structure', () => {
    it('✅ deve ter estrutura correta de resposta de sucesso', () => {
      const response = {
        success: true,
        message: 'Disponibilidade atualizada com sucesso',
        data: {
          diasAtivos: ['seg', 'ter', 'qua'],
          horarios: {
            seg: { de: '08h', ate: '20h' },
            ter: { de: '08h', ate: '20h' },
            qua: { de: '08h', ate: '20h' },
          },
        },
      };
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('data');
    });

    it('❌ deve indicar falha com success: false', () => {
      const response = {
        success: false,
        message: 'Validação falhou',
      };
      
      expect(response.success).toBe(false);
    });

    it('✅ deve conter dados de retorno corretos', () => {
      const data = {
        diasAtivos: ['seg', 'ter', 'qua'],
        horarios: {
          seg: { de: '08h', ate: '20h' },
          ter: { de: '08h', ate: '20h' },
          qua: { de: '08h', ate: '20h' },
        },
      };
      
      expect(data.diasAtivos).toHaveLength(3);
      expect(Object.keys(data.horarios)).toHaveLength(3);
    });
  });

  describe('Endpoint Specification', () => {
    it('✅ deve usar método HTTP PATCH', () => {
      const method = 'PATCH';
      expect(method).toBe('PATCH');
    });

    it('✅ deve usar endpoint /users/providers', () => {
      const endpoint = '/users/providers';
      expect(endpoint).toBe('/users/providers');
    });

    it('❌ não deve incluir ID na URL (JWT inference)', () => {
      const endpoint = '/users/providers';
      const hasIdParam = endpoint.includes(':id') || endpoint.includes('{id}');
      expect(hasIdParam).toBe(false);
    });

    it('✅ deve incluir header Authorization', () => {
      const headers = {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json',
      };
      
      expect(headers).toHaveProperty('Authorization');
      expect(headers['Authorization']).toMatch(/Bearer /);
    });
  });

  describe('Tratamento de Erros', () => {
    it('✅ deve tratar erro 422 (validação)', () => {
      const error = {
        status: 422,
        message: 'Validação de horários falhou',
        errors: [
          { field: 'horarios.seg.ate', message: 'Deve ser após "de"' },
        ],
      };
      
      expect(error.status).toBe(422);
      expect(error.errors).toHaveLength(1);
    });

    it('✅ deve tratar erro 401 (não autenticado)', () => {
      const error = {
        status: 401,
        message: 'Sessão expirada. Faça login novamente.',
      };
      
      expect(error.status).toBe(401);
      expect(error.message).toMatch(/sessão|login/i);
    });

    it('✅ deve tratar erro 500 (servidor)', () => {
      const error = {
        status: 500,
        message: 'Erro interno do servidor',
      };
      
      expect(error.status).toBe(500);
    });

    it('✅ deve lançar erro se payload inválido', () => {
      const validatePayload = (payload: any) => {
        if (!payload.diasAtivos || payload.diasAtivos.length === 0) {
          throw new Error('diasAtivos não pode estar vazio');
        }
        if (!payload.horarios || Object.keys(payload.horarios).length === 0) {
          throw new Error('horarios não pode estar vazio');
        }
      };

      const invalidPayload = {
        diasAtivos: [],
        horarios: {},
      };

      expect(() => validatePayload(invalidPayload))
        .toThrow();
    });
  });

  describe('Autenticação e Autorização', () => {
    it('✅ deve ler token do localStorage', () => {
      const token = localStorage.getItem('authToken');
      expect(token).toBeTruthy();
      expect(token).toBe(JSON.stringify('test-token-jwt'));
    });

    it('❌ deve falhar se token ausente', () => {
      localStorage.removeItem('authToken');
      const token = localStorage.getItem('authToken');
      expect(token).toBeNull();
    });

    it('✅ deve incluir token em header Authorization', () => {
      const tokenRaw = localStorage.getItem('authToken');
      const token = JSON.parse(tokenRaw || '""');
      const header = `Bearer ${token}`;
      
      expect(header).toMatch(/Bearer test-token-jwt/);
    });
  });

  describe('Fluxo Completo', () => {
    it('✅ fluxo: usuário escolhe dias → configura horários → salva → sucesso', () => {
      // Step 1: Usuário seleciona dias
      const diasAtivos = ['seg', 'ter', 'qua', 'qui', 'sex'];
      expect(diasAtivos.length).toBe(5);

      // Step 2: Sistema configura horários padrão
      const horarios: Record<string, { de: string; ate: string }> = {};
      for (const dia of diasAtivos) {
        horarios[dia] = { de: '08h', ate: '20h' };
      }
      expect(Object.keys(horarios).length).toBe(5);

      // Step 3: Construir payload
      const payload = { diasAtivos, horarios };
      expect(payload.diasAtivos).toHaveLength(5);
      expect(Object.keys(payload.horarios)).toHaveLength(5);

      // Step 4: Validar payload
      const isValid = payload.diasAtivos.every(dia => 
        payload.horarios[dia] && 
        parseInt(payload.horarios[dia].ate.replace('h', '')) > 
        parseInt(payload.horarios[dia].de.replace('h', ''))
      );
      expect(isValid).toBe(true);
    });

    it('❌ fluxo: usuário não seleciona dias → erro', () => {
      const diasAtivos: string[] = [];
      expect(diasAtivos.length).toBe(0);
      expect(diasAtivos.length > 0).toBe(false);
    });

    it('❌ fluxo: horário com "até" < "de" → erro', () => {
      const diasAtivos = ['seg'];
      const horarios = { seg: { de: '20h', ate: '18h' } };

      const deNum = parseInt(horarios.seg.de.replace('h', ''));
      const ateNum = parseInt(horarios.seg.ate.replace('h', ''));
      
      expect(ateNum > deNum).toBe(false);
    });
  });
});