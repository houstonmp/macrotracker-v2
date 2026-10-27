import { describe, expect, it } from 'vitest';
import { dayNumber, dateFromDay, goalLevels, paceLines, weightView, yBounds } from './weightRange';

const today = dayNumber('2026-10-27');
const weights = [
    { date: '2026-10-27', lbs: 243.8 },
    { date: '2025-12-01', lbs: 260 },
    { date: '2026-10-13', lbs: 246.6 },
    { date: '2026-10-24', lbs: 244.5 },
    { date: '2026-09-15', lbs: 250 },
];

describe('weightView', () => {
    it('round-trips dates through day numbers', () => {
        expect(dateFromDay(dayNumber('2026-03-08'))).toBe('2026-03-08');
    });

    it('keeps the range and the weigh-in just before it', () => {
        const week = weightView(weights, 'week', today);
        expect(week.inRange.map(el => el.date)).toEqual(['2026-10-24', '2026-10-27']);
        expect(week.points.map(el => el.y)).toEqual([246.6, 244.5, 243.8]);
        expect(week.change).toBe(-0.7);
    });

    it('has no change with fewer than two weigh-ins', () => {
        expect(weightView([{ date: '2026-10-27', lbs: 240 }], 'week', today).change).toBe(null);
        expect(weightView([], 'month', today).points).toEqual([]);
    });
});

describe('weightView averages', () => {
    it('draws the year as weekly averages', () => {
        const daily = ['2026-10-21', '2026-10-22', '2026-10-23'].map((date, i) => ({ date, lbs: 240 + i }));
        const year = weightView(daily, 'year', today);
        expect(year.points).toHaveLength(1);
        expect(year.points[0].y).toBe(241);
        expect(year.inRange).toHaveLength(3);
    });
});

describe('paceLines', () => {
    it('runs flat and goal-pace lines from the first weigh-in in the range', () => {
        const week = weightView(weights, 'week', today);
        const pace = paceLines(week, 2);
        // First weigh-in in the week is 244.5 on Oct 24; three days at 2 lbs/week is 0.857
        expect(pace.flat).toEqual([{ x: dayNumber('2026-10-24'), y: 244.5 }, { x: today, y: 244.5 }]);
        expect(pace.goal[1].y).toBe(243.6);
        expect(pace.goalAt(today)).toBe(243.6);
    });

    it('is off for the year, without a goal, or without weigh-ins', () => {
        expect(paceLines(weightView(weights, 'year', today), 2)).toBe(null);
        expect(paceLines(weightView(weights, 'week', today), undefined)).toBe(null);
        expect(paceLines(weightView([], 'week', today), 2)).toBe(null);
    });

    it('widens the week bounds to show the goal line', () => {
        const view = weightView(weights, 'month', today);
        const pace = paceLines(view, 2);
        expect(yBounds(view, 70, pace).min).toBeLessThan(pace.goalAt(today));
    });
});

describe('goalLevels', () => {
    it('sets half and full goal levels for the period from its first weigh-in', () => {
        // Week from 244.5: 2 lbs/week goal
        expect(goalLevels(weightView(weights, 'week', today), 2)).toEqual({ start: 244.5, half: 243.5, full: 242.5 });
        // Month from 246.6 (Oct 13 is the first in the past 30 days): 30/7 weeks
        expect(goalLevels(weightView(weights, 'month', today), 2)).toEqual({ start: 246.6, half: 242.3, full: 238 });
    });

    it('is off for the year and without a goal', () => {
        expect(goalLevels(weightView(weights, 'year', today), 2)).toBe(null);
        expect(goalLevels(weightView(weights, 'month', today), 0)).toBe(null);
    });
});

describe('yBounds', () => {
    it('fits week and month to the weigh-ins', () => {
        const bounds = yBounds(weightView(weights, 'week', today), 70);
        expect(bounds).toEqual({ min: 241, max: 249 });
    });

    it('stretches the year to the top of the healthy range', () => {
        // BMI 25 at 70 in is 174 lbs
        expect(yBounds(weightView(weights, 'year', today), 70).min).toBeLessThanOrEqual(174);
    });
});
