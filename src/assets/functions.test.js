import { describe, expect, it } from 'vitest';
import { BMRMifflin, BodyFatMenImperial, BodyFatWomenImperial, MacrosByDiceSplit, TDEE, formatDay, getAgeFromBirthday } from './functions';

describe('BMRMifflin', () => {
    it('uses the male constant by default', () => {
        expect(BMRMifflin(90, 180, 30, 'male')).toBe(1880);
        expect(BMRMifflin(90, 180, 30)).toBe(1880);
    });

    it('uses the female constant', () => {
        expect(BMRMifflin(90, 180, 30, 'female')).toBe(1714);
    });
});

describe('getAgeFromBirthday', () => {
    const today = new Date(2026, 9, 27);

    it('does not count a birthday that is still to come this year', () => {
        expect(getAgeFromBirthday('1990-10-28', today)).toBe(35);
        expect(getAgeFromBirthday('1990-12-15', today)).toBe(35);
    });

    it('counts a birthday on or before today', () => {
        expect(getAgeFromBirthday('1990-10-27', today)).toBe(36);
        expect(getAgeFromBirthday('1990-01-01', today)).toBe(36);
    });
});

describe('daily targets', () => {
    it('splits the goal 40/40/20 after the deficit', () => {
        const tdee = TDEE(1.2, 2000);
        expect(tdee).toBe(2400);
        expect(MacrosByDiceSplit(tdee, 500)).toEqual({ goalProtein: 190, goalCarbs: 190, goalFat: 42, goalCalories: 1900 });
    });
});

describe('Navy body fat (inches)', () => {
    it('matches the published formula for men', () => {
        expect(BodyFatMenImperial(34, 15, 70)).toBeCloseTo(17.51, 1);
    });

    it('matches the published formula for women', () => {
        expect(BodyFatWomenImperial(30, 38, 13, 65)).toBeCloseTo(28.56, 1);
    });
});

describe('formatDay', () => {
    const today = new Date('2026-10-27T12:00:00Z');
    it('shows the weekday and date, adding the year only for other years', () => {
        expect(formatDay('2026-10-27', { today })).toBe('Tue, Oct 27');
        expect(formatDay('2026-10-27', { weekday: false, today })).toBe('Oct 27');
        expect(formatDay('2025-12-31', { today })).toBe('Wed, Dec 31, 2025');
    });
});
