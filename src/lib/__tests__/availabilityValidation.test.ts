/**
 * Testes de validação de disponibilidade de horários
 * Caso de uso: Freelancer atualiza dias e horários de trabalho
 */

import { describe, it, expect } from 'vitest';

/**
 * Valida se o horário 'até' é posterior ao horário 'de'
 */
function validateTimeRange(de: string, ate: string): { valid: boolean; error?: string } {
  const deNum = parseInt(de.replace('h', ''));
  const ateNum = parseInt(ate.replace('h', ''));

  if (isNaN(deNum) || isNaN(ateNum)) {
    return { valid: false, error: 'Formato de hora inválido' };
  }

  if (deNum < 0 || deNum > 23 || ateNum < 0 || ateNum > 23) {
    return { valid: false, error: 'Horas devem estar entre 00h e 23h' };
  }

  if (ateNum <= deNum) {
    return { valid: false, error: 'Horário "até" não pode ser menor ou igual a "de"' };
  }

  return { valid: true };
}

/**
 * Valida se todos os dias ativos têm horários configurados
 */
function validateDaysHaveHours(
  diasAtivos: string[],
  horarios: Record<string, { de: string; ate: string }>,
): { valid: boolean; error?: string; invalidDays?: string[] } {
  const invalidDays: string[] = [];

  for (const dia of diasAtivos) {
    if (!horarios[dia]) {
      invalidDays.push(dia);
    }
  }

  if (invalidDays.length > 0) {
    return {
      valid: false,
      error: `Dias sem horário configurado: ${invalidDays.join(', ')}`,
      invalidDays,
    };
  }

  return { valid: true };
}

describe('Availability Validation', () => {
  describe('validateTimeRange', () => {
    it('should accept valid time range', () => {
      const result = validateTimeRange('08h', '20h');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept minimal range (difference of 1 hour)', () => {
      const result = validateTimeRange('08h', '09h');
      expect(result.valid).toBe(true);
    });

    it('should accept full day (00h to 23h)', () => {
      const result = validateTimeRange('00h', '23h');
      expect(result.valid).toBe(true);
    });

    it('should reject when ate equals de', () => {
      const result = validateTimeRange('10h', '10h');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não pode ser menor ou igual a');
    });

    it('should reject when ate is less than de', () => {
      const result = validateTimeRange('20h', '08h');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não pode ser menor ou igual a');
    });

    it('should reject hour > 23', () => {
      const result = validateTimeRange('08h', '25h');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('entre 00h e 23h');
    });

    it('should reject negative hours', () => {
      const result = validateTimeRange('-1h', '10h');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('entre 00h e 23h');
    });

    it('should reject invalid format', () => {
      const result = validateTimeRange('', '20h');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de hora inválido');
    });
  });

  describe('validateDaysHaveHours', () => {
    const validHorarios = {
      seg: { de: '08h', ate: '20h' },
      ter: { de: '08h', ate: '20h' },
      qua: { de: '08h', ate: '20h' },
      qui: { de: '08h', ate: '20h' },
      sex: { de: '08h', ate: '20h' },
      sab: { de: '10h', ate: '16h' },
      dom: { de: '10h', ate: '14h' },
    };

    it('should accept when all active days have hours', () => {
      const result = validateDaysHaveHours(['seg', 'ter', 'qua'], validHorarios);
      expect(result.valid).toBe(true);
    });

    it('should accept empty active days (user unavailable)', () => {
      const result = validateDaysHaveHours([], validHorarios);
      expect(result.valid).toBe(true);
    });

    it('should accept when weekend is active with hours', () => {
      const result = validateDaysHaveHours(['sab', 'dom'], validHorarios);
      expect(result.valid).toBe(true);
    });

    it('should reject when active day has no hours', () => {
      const incompletHorarios = { ...validHorarios };
      delete incompletHorarios.seg;

      const result = validateDaysHaveHours(['seg', 'ter'], incompletHorarios);
      expect(result.valid).toBe(false);
      expect(result.invalidDays).toContain('seg');
    });

    it('should report multiple missing days', () => {
      const incompletHorarios = { ...validHorarios };
      delete incompletHorarios.seg;
      delete incompletHorarios.qua;

      const result = validateDaysHaveHours(['seg', 'ter', 'qua'], incompletHorarios);
      expect(result.valid).toBe(false);
      expect(result.invalidDays).toEqual(['seg', 'qua']);
    });

    it('should accept when some days have no hours but are not active', () => {
      const incompletHorarios = { seg: { de: '08h', ate: '20h' } };

      const result = validateDaysHaveHours(['seg'], incompletHorarios);
      expect(result.valid).toBe(true);
    });
  });

  describe('Integration: Full validation flow', () => {
    it('should pass complete valid scenario', () => {
      const diasAtivos = ['seg', 'ter', 'qua', 'qui', 'sex'];
      const horarios = {
        seg: { de: '08h', ate: '18h' },
        ter: { de: '08h', ate: '18h' },
        qua: { de: '08h', ate: '18h' },
        qui: { de: '08h', ate: '18h' },
        sex: { de: '08h', ate: '18h' },
      };

      // Validar estrutura
      const daysValidation = validateDaysHaveHours(diasAtivos, horarios);
      expect(daysValidation.valid).toBe(true);

      // Validar cada horário
      for (const dia of diasAtivos) {
        const timeValidation = validateTimeRange(horarios[dia].de, horarios[dia].ate);
        expect(timeValidation.valid).toBe(true);
      }
    });

    it('should fail when one day has invalid time range', () => {
      const diasAtivos = ['seg', 'ter', 'qua'];
      const horarios = {
        seg: { de: '08h', ate: '18h' },
        ter: { de: '18h', ate: '08h' }, // Invalid: after < before
        qua: { de: '08h', ate: '18h' },
      };

      const daysValidation = validateDaysHaveHours(diasAtivos, horarios);
      expect(daysValidation.valid).toBe(true); // Structure is valid

      // But time validation fails
      const terValidation = validateTimeRange(horarios.ter.de, horarios.ter.ate);
      expect(terValidation.valid).toBe(false);
    });

    it('should support weekend addition (regression test for bug)', () => {
      const diasAtivos = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
      const horarios = {
        seg: { de: '08h', ate: '20h' },
        ter: { de: '08h', ate: '20h' },
        qua: { de: '08h', ate: '20h' },
        qui: { de: '08h', ate: '20h' },
        sex: { de: '08h', ate: '20h' },
        sab: { de: '10h', ate: '16h' },
        dom: { de: '10h', ate: '14h' },
      };

      // Should pass: weekend is now in diasAtivos and has hours
      const daysValidation = validateDaysHaveHours(diasAtivos, horarios);
      expect(daysValidation.valid).toBe(true);

      for (const dia of diasAtivos) {
        const timeValidation = validateTimeRange(horarios[dia].de, horarios[dia].ate);
        expect(timeValidation.valid).toBe(true);
      }
    });
  });
});
