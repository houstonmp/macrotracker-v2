import { describe, expect, it } from 'vitest';
import { dayNumber, dateFromDay, goalLevels, paceLines, periodBounds, periodTitle, weightView, yBounds } from './weightRange';

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

    it('runs weeks Sunday to Saturday', () => {
        // Oct 27 2026 is a Tuesday
        expect(periodBounds('week', today)).toEqual({ start: dayNumber('2026-10-25'), end: dayNumber('2026-11-01') });
        expect(periodBounds('week', dayNumber('2026-10-25')).start).toBe(dayNumber('2026-10-25'));
        expect(periodBounds('week', dayNumber('2026-10-31')).start).toBe(dayNumber('2026-10-25'));
        expect(periodBounds('week', today, -1).start).toBe(dayNumber('2026-10-18'));
    });

    it('runs months from the 1st, across year ends', () => {
        expect(periodBounds('month', today)).toEqual({ start: dayNumber('2026-10-01'), end: dayNumber('2026-11-01') });
        expect(periodBounds('month', dayNumber('2026-01-15'), -1)).toEqual({ start: dayNumber('2025-12-01'), end: dayNumber('2026-01-01') });
    });

    it('titles periods', () => {
        expect(periodTitle('week', dayNumber('2026-10-25'), dayNumber('2026-11-01'))).toBe('Oct 25 – 31');
        expect(periodTitle('week', dayNumber('2026-09-27'), dayNumber('2026-10-04'))).toBe('Sep 27 – Oct 3');
        expect(periodTitle('month', dayNumber('2026-10-01'), dayNumber('2026-11-01'))).toBe('October 2026');
    });

    it('keeps the period and the weigh-ins either side of it', () => {
        const week = weightView(weights, 'week', today, -1);
        expect(week.inRange.map(el => el.date)).toEqual(['2026-10-24']);
        expect(week.points.map(el => el.y)).toEqual([246.6, 244.5, 243.8]);
        expect(week).toMatchObject({ current: false, hasEarlier: true, phrase: 'last week' });
        // A past week is drawn whole: Sunday to Saturday, half a day either side
        expect(week.axis).toEqual({ min: dayNumber('2026-10-18') - 0.5, max: dayNumber('2026-10-24') + 0.5 });
        const month = weightView(weights, 'month', today);
        expect(month.inRange.map(el => el.date)).toEqual(['2026-10-13', '2026-10-24', '2026-10-27']);
        expect(month.change).toBe(-2.8);
        expect(month).toMatchObject({ current: true, phrase: 'this month' });
        // The current month stops at today
        expect(month.axis).toEqual({ min: dayNumber('2026-10-01') - 0.5, max: today + 0.5 });
    });

    it('draws at least two days on the first day of a period', () => {
        const sunday = dayNumber('2026-10-25');
        expect(weightView(weights, 'week', sunday).axis).toEqual({ min: sunday - 0.5, max: sunday + 1.5 });
    });

    it('stops paging back at the first weigh-in', () => {
        // The first weigh-in is Dec 1 2025, ten months back
        expect(weightView(weights, 'month', today, -9).hasEarlier).toBe(true);
        expect(weightView(weights, 'month', today, -10)).toMatchObject({ title: 'December 2025', hasEarlier: false });
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
    it('runs from the first weigh-in of the month to its end, with a fixed target', () => {
        const pace = paceLines(weightView(weights, 'month', today), 2);
        // From 246.6 on Oct 13 to Nov 1 is 19 days: 2 lbs/week takes off 5.4. The lines
        // stop at today with the chart, but the target is still the month's end.
        expect(pace.flat).toEqual([{ x: dayNumber('2026-10-13'), y: 246.6 }, { x: today + 0.5, y: 246.6 }]);
        expect(pace.target).toBe(241.2);
        expect(pace.goalAt(dayNumber('2026-10-20'))).toBe(244.6);
    });

    it('gives a full week of goal to a week starting on Sunday', () => {
        const pace = paceLines(weightView([{ date: '2026-10-25', lbs: 240 }], 'week', today), 2);
        expect(pace.target).toBe(238);
    });

    it('is off for the year, without a goal, or without weigh-ins', () => {
        expect(paceLines(weightView(weights, 'year', today), 2)).toBe(null);
        expect(paceLines(weightView(weights, 'week', today), undefined)).toBe(null);
        expect(paceLines(weightView([], 'week', today), 2)).toBe(null);
    });

    it('widens the bounds to show the goal line', () => {
        const view = weightView(weights, 'month', today);
        const pace = paceLines(view, 2);
        expect(yBounds(view, 70, pace).min).toBeLessThan(pace.target);
    });
});

describe('goalLevels', () => {
    it('puts the full goal at the target and the half goal halfway', () => {
        expect(goalLevels(weightView(weights, 'month', today), 2)).toEqual({ start: 246.6, half: 243.9, full: 241.2 });
    });

    it('is off for the year and without a goal', () => {
        expect(goalLevels(weightView(weights, 'year', today), 2)).toBe(null);
        expect(goalLevels(weightView(weights, 'month', today), 0)).toBe(null);
    });
});

describe('yBounds', () => {
    it('fits week and month to the weigh-ins', () => {
        const bounds = yBounds(weightView(weights, 'week', today, -1), 70);
        expect(bounds).toEqual({ min: 241, max: 249 });
    });

    it('stretches the year to the top of the healthy range', () => {
        // BMI 25 at 70 in is 174 lbs
        expect(yBounds(weightView(weights, 'year', today), 70).min).toBeLessThanOrEqual(174);
    });
});
