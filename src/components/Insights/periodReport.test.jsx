import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from '../store/ui-slice';
import weightSlice from '../store/weight-slice';
import foodDiarySlice from '../store/food-diary-slice';
import { exerciseGrade } from '../Exercise/exercise';
import { foodPeriod, overallGrade, periodReport, workoutPeriod } from './periodReport';
import ReportCard from './ReportCard';

const targets = { BMR: 2200, TDEEValue: 3000, dailyMacros: { goalCalories: 2000, goalProtein: 200, goalCarbs: 200, goalFat: 44 } };
// A balanced 2,000 kcal day on the 40/40/20 split: an A+ day
const goodDay = (date) => ({
    date, water: [], macros: { calories: 2000, protein: 200, carbs: 200, fat: 44 },
    food: [{ id: date, name: 'Meals', amount: '1', macros: { calories: 2000, protein: 200, carbs: 200, fat: 44 } }],
});
const walk = (id) => ({ id, name: 'Walk', minutes: 30, calories: null, source: 'manual' });
const dates = (from, count) => Array.from({ length: count }, (_, i) => {
    const d = new Date(`${from}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toJSON().slice(0, 10);
});

describe('workout grade', () => {
    it('goes by workout days a week: 3 C, 4 B, 5 A, 6-7 A+, otherwise D', () => {
        expect([0, 1, 2, 3, 4, 5, 6, 7].map(exerciseGrade)).toEqual(['D', 'D', 'D', 'C', 'B', 'A', 'A+', 'A+']);
        expect(exerciseGrade(3.9)).toBe('C');
    });

    it('counts a week as is, and a month as its weekly average', () => {
        const week = dates('2026-10-25', 7);
        const fourDays = week.slice(0, 4).map(date => ({ date, food: [], water: [], exercise: [walk(date)] }));
        expect(workoutPeriod(fourDays, week, '2026-10-31')).toMatchObject({ activeDays: 4, perWeek: 4, grade: 'B' });

        // Every third day of a finished 31-day month is 11 workout days, 2.5 a week
        const month = dates('2026-08-01', 31);
        const everyThird = month.filter((_, i) => i % 3 === 0).map(date => ({ date, food: [], water: [], exercise: [walk(date)] }));
        expect(workoutPeriod(everyThird, month, '2026-10-29')).toMatchObject({ activeDays: 11, perWeek: 2.5, grade: 'D' });
    });

    it('never counts less than a week early in a period', () => {
        const month = dates('2026-10-01', 31);
        const first = [{ date: '2026-10-01', food: [], water: [], exercise: [walk('a')] }];
        // One workout on the 1st is one day a week, not seven
        expect(workoutPeriod(first, month, '2026-10-01')).toMatchObject({ perWeek: 1, grade: 'D' });
    });
});

describe('overall grade', () => {
    it('averages the grades there are', () => {
        expect(overallGrade(['A', 'C', 'B'])).toBe('B');
        expect(overallGrade(['A+', 'A+', 'A'])).toBe('A+');
        expect(overallGrade(['A', null, 'D'])).toBe('B');
        expect(overallGrade([null])).toBeNull();
    });
});

describe('food over a period', () => {
    it('averages the day scores of the days with food, leaving out untracked days and the future', () => {
        const diary = [goodDay('2026-10-26'), goodDay('2026-10-27'), { ...goodDay('2026-10-28'), untracked: true }, goodDay('2026-10-31')];
        expect(foodPeriod(diary, targets, dates('2026-10-25', 7), '2026-10-29')).toMatchObject({ days: 2, calories: 2000, grade: 'A+' });
        expect(foodPeriod(diary, null, dates('2026-10-25', 7), '2026-10-29')).toBeNull();
    });
});

describe('report card', () => {
    const diary = ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28'].map(date => ({ ...goodDay(date), exercise: [walk(date)] }));
    const weights = [{ date: '2026-10-25', lbs: 240 }, { date: '2026-10-29', lbs: 239 }];
    const data = { diaryObj: diary, weights, targets, lbsPerWeek: 1 };

    it('grades the chart week', () => {
        const report = periodReport(data, 'week', 0, '2026-10-29');
        expect(report).toMatchObject({ title: 'Oct 25 – 31', current: true });
        expect(report.food.grade).toBe('A+');
        expect(report.weight).toMatchObject({ grade: 'A+', change: -1, onPace: true });
        expect(report.workouts).toMatchObject({ activeDays: 4, grade: 'B' });
        expect(report.overall).toBe('A');
    });

    it('grades the chart month, and a week with nothing in it', () => {
        const month = periodReport(data, 'month', 0, '2026-10-29');
        expect(month.title).toBe('October 2026');
        // 4 workout days over 29 days so far is about one a week
        expect(month.workouts).toMatchObject({ activeDays: 4, perWeek: 1, grade: 'D' });
        expect(month.food.grade).toBe('A+');

        const lastWeek = periodReport(data, 'week', -1, '2026-10-29');
        expect(lastWeek).toMatchObject({ title: 'Oct 18 – 24', current: false, food: null, weight: null, overall: 'D' });
    });

    it('works for the year', () => {
        const year = periodReport(data, 'year', 0, '2026-10-29');
        expect(year.title).toBe('Past year');
        expect(year.food.days).toBe(4);
    });

    it('renders on Insights', () => {
        const store = configureStore({
            reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer },
            preloadedState: { fDiary: { diaryObj: diary, changed: false } },
        });
        const html = renderToString(<Provider store={store}><ReportCard rangeId="month" offset={0} /></Provider>).replace(/<!-- -->/g, '');
        expect(html).toContain('Report card');
        for (const label of ['Food', 'Weight', 'Workouts', 'Overall']) {
            expect(html).toContain(label);
        }
    });
});
