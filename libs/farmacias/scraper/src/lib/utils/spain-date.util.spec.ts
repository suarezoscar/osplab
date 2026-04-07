import {
  formatSpainDate,
  formatSpainDateDMY,
  formatSpainTime,
  getSpainToday,
} from './spain-date.util';

describe('spain-date.util', () => {
  // ─── formatSpainDate ──────────────────────────────────────────────────────

  describe('formatSpainDate', () => {
    it('formatea como YYYY-MM-DD en hora española', () => {
      // 2026-04-06 14:30 CEST = 2026-04-06 12:30 UTC
      expect(formatSpainDate(new Date('2026-04-06T12:30:00Z'))).toBe('2026-04-06');
    });

    it('rellena mes y día con ceros', () => {
      // 2026-01-05 10:00 CET = 2026-01-05 09:00 UTC
      expect(formatSpainDate(new Date('2026-01-05T09:00:00Z'))).toBe('2026-01-05');
    });

    it('usa el día español cuando UTC y España difieren', () => {
      // 2026-04-07 23:30 UTC = 2026-04-08 01:30 CEST
      expect(formatSpainDate(new Date('2026-04-07T23:30:00Z'))).toBe('2026-04-08');
    });
  });

  // ─── formatSpainDateDMY ───────────────────────────────────────────────────

  describe('formatSpainDateDMY', () => {
    it('formatea como DD/MM/YYYY', () => {
      expect(formatSpainDateDMY(new Date('2026-04-06T12:30:00Z'))).toBe('06/04/2026');
    });

    it('rellena mes y día con ceros', () => {
      expect(formatSpainDateDMY(new Date('2026-01-05T09:00:00Z'))).toBe('05/01/2026');
    });
  });

  // ─── formatSpainTime ──────────────────────────────────────────────────────

  describe('formatSpainTime', () => {
    it('formatea como HH:MM:SS en hora española', () => {
      // 2026-04-06 12:30:45 UTC = 14:30:45 CEST
      expect(formatSpainTime(new Date('2026-04-06T12:30:45Z'))).toBe('14:30:45');
    });

    it('maneja medianoche UTC como hora española del día siguiente', () => {
      // 2026-04-07 00:00:00 UTC = 02:00:00 CEST
      expect(formatSpainTime(new Date('2026-04-07T00:00:00Z'))).toBe('02:00:00');
    });

    it('formatea correctamente en horario de invierno (CET = UTC+1)', () => {
      // 2026-01-15 10:00:00 UTC = 11:00:00 CET
      expect(formatSpainTime(new Date('2026-01-15T10:00:00Z'))).toBe('11:00:00');
    });
  });

  // ─── getSpainToday ────────────────────────────────────────────────────────

  describe('getSpainToday', () => {
    it('retorna una fecha a medianoche UTC', () => {
      const today = getSpainToday();
      expect(today.getUTCHours()).toBe(0);
      expect(today.getUTCMinutes()).toBe(0);
      expect(today.getUTCSeconds()).toBe(0);
    });

    it('retorna una fecha con formato ISO válido', () => {
      const today = getSpainToday();
      expect(today.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
    });
  });
});
