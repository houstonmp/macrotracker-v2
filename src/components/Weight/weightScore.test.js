import { describe, expect, it } from 'vitest';
import { dayNumber } from './weightRange';
import { gradeFor, loggedCalories, periodScore, targetStreak } from './weightScore';

const today = dayNumber('2026-10-27');
const weights = [
    // Last week: Sunday 240 to Saturday 238, a full 2 lbs/week's pace
    { date: '2026-10-18', lbs: 240 },
    { date: '2026-10-21', lbs: 239.4 },
    { date: '2026-10-24', lbs: 238 },
    // The week before: 241 to 240.5
    { date: '2026-10-11', lbs: 241 },
    { date: '2026-10-17', lbs: 240.5 },
    // This week so far
    { date: '2026-10-25', lbs: 238.2 },
];

describe('periodScore', () => {
    it('scores a finished week against goal pace', () => {
        const week = periodScore(weights, 'week', today, -1, 2);
        expect(week).toMatchObject({ first: 240, last: 238, low: 238, change: -2, weighInDays: 3, days: 6, perWeek: -2.3, kcalPerDay: 1167 });
        // 2 lbs in 6 days is ahead of the 1.71 lbs goal pace for that time
        expect(week.score).toMatchObject({ grade: 'A', met: true, onPace: true, toTarget: 0 });
    });

    it('needs two days of weigh-ins for a grade', () => {
        const week = periodScore(weights, 'week', today, 0, 2);
        expect(week.weighIns).toBe(1);
        expect(week.score).toBeUndefined();
        expect(week.pace.target).toBe(236.2);
    });

    it('skips the grade without a weekly goal and reports nothing without weigh-ins', () => {
        expect(periodScore(weights, 'week', today, -1, 0).score).toBeUndefined();
        expect(periodScore(weights, 'week', today, -5, 2)).toMatchObject({ weighIns: 0 });
    });
});

describe('grades', () => {
    it('gives D at the bottom, never lower', () => {
        expect([1.3, 1, 0.8, 0.5, 0.1, -2].map(gradeFor)).toEqual(['A+', 'A', 'B', 'C', 'D', 'D']);
    });
});

describe('targetStreak', () => {
    it('counts finished periods on target, and this one only once it is', () => {
        // Last week met; the week before lost 0.5 of 2: the run is 1
        expect(targetStreak(weights, 'week', today, 2)).toBe(1);
        expect(targetStreak(weights, 'week', today, 0.25)).toBe(2);
    });
});

describe('loggedCalories', () => {
    it('averages the days with food logged', () => {
        const diary = [
            { date: '2026-10-19', macros: { calories: 2000 } },
            { date: '2026-10-20', macros: { calories: 1800 } },
            { date: '2026-10-21', macros: { calories: 0 } },
            { date: '2026-10-26', macros: { calories: 2500 } },
        ];
        expect(loggedCalories(diary, 'week', today, -1)).toEqual({ average: 1900, days: 2 });
        expect(loggedCalories([], 'week', today, 0)).toBe(null);
    });
});
