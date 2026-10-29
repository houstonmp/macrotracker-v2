import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from '../store/ui-slice';
import weightSlice from '../store/weight-slice';
import foodDiarySlice, { foodDiaryActions } from '../store/food-diary-slice';
import { migrateDiaryObj } from '../../assets/food';
import { localDate } from '../../assets/functions';
import { exerciseTotals, formatMinutes, planRideSync, rideDetail, rideEntry, weekOf, weekReport } from './exercise';
import ExerciseDiary from './ExerciseDiary';
import ExerciseWeek from './ExerciseWeek';

const reduce = (actions, state = foodDiarySlice.getInitialState()) => actions.reduce(foodDiarySlice.reducer, state);

const walk = { id: 'w1', name: 'Walk', minutes: 30, calories: null, source: 'manual' };
const ride = {
    id: 'ride-1793300000', start: '2026-10-29T17:00:00+00:00', end: '2026-10-29T17:40:00+00:00', minutes: 40,
    distanceKm: 15.2, calories: 380, caloriesFrom: 'power', workKj: 381, avgPower: 158, maxPower: 260,
    avgCadence: 82, avgSpeed: 22.8, avgHeartRate: null,
};

describe('exercise in the diary', () => {
    it('starts a day for exercise alone, ignores a repeat, and removes the day once empty', () => {
        let state = reduce([
            foodDiaryActions.addExercise({ date: '2026-10-28', entry: walk }),
            foodDiaryActions.addExercise({ date: '2026-10-28', entry: walk }),
        ]);
        expect(state.diaryObj).toHaveLength(1);
        expect(state.diaryObj[0].exercise).toEqual([walk]);
        state = reduce([foodDiaryActions.removeExercise({ date: '2026-10-28', id: 'w1' })], state);
        expect(state.diaryObj).toEqual([]);
    });

    it('keeps food when the exercise is removed, without leaving an empty list', () => {
        let state = reduce([
            foodDiaryActions.addFood({ date: '2026-10-28', entry: { id: 'f', name: 'Bar', macros: { calories: 200, protein: 10, carbs: 20, fat: 8 } } }),
            foodDiaryActions.addExercise({ date: '2026-10-28', entry: walk }),
            foodDiaryActions.removeExercise({ date: '2026-10-28', id: 'w1' }),
        ]);
        expect(state.diaryObj[0].food).toHaveLength(1);
        expect(state.diaryObj[0]).not.toHaveProperty('exercise');
    });

    it('survives a load from Firebase, and a day with only exercise is kept', () => {
        const days = migrateDiaryObj([{ date: '2026-10-28', exercise: [walk] }, { date: '2026-10-27', food: [] }]);
        expect(days).toHaveLength(1);
        expect(days[0].exercise).toEqual([walk]);
    });
});

describe('exercise totals and the week', () => {
    it('only counts calories that are known', () => {
        expect(exerciseTotals([walk])).toEqual({ count: 1, minutes: 30, burned: null });
        expect(exerciseTotals([walk, { ...walk, id: 'w2', minutes: 15, calories: 120 }])).toEqual({ count: 2, minutes: 45, burned: 120 });
    });

    it('formats minutes', () => {
        expect(formatMinutes(45)).toBe('45 min');
        expect(formatMinutes(60)).toBe('1 h');
        expect(formatMinutes(85)).toBe('1 h 25 min');
    });

    it('runs Sunday to Saturday', () => {
        // Oct 29, 2026 is a Thursday
        const week = weekOf('2026-10-29');
        expect(week[0]).toEqual({ label: 'Su', date: '2026-10-25' });
        expect(week[6]).toEqual({ label: 'Sa', date: '2026-10-31' });
        expect(weekOf('2026-10-25')[0].date).toBe('2026-10-25');
    });

    it('checks off the days you exercised and totals the week', () => {
        const diary = [
            { date: '2026-10-26', food: [], water: [], exercise: [walk] },
            { date: '2026-10-29', food: [], water: [], exercise: [rideEntry(ride).entry] },
            // The Sunday after belongs to the next week
            { date: '2026-11-01', food: [], water: [], exercise: [walk] },
        ];
        const report = weekReport(diary, '2026-10-29');
        expect(report.days.map(day => day.active)).toEqual([false, true, false, false, true, false, false]);
        expect(report).toMatchObject({ activeDays: 2, count: 2, minutes: 70, burned: 380, rides: 1, distanceKm: 15.2 });
    });
});

describe('bike rides', () => {
    it('become an entry on the day they started, in your time zone', () => {
        const { date, entry } = rideEntry(ride);
        expect(date).toBe(localDate(new Date(ride.start)));
        expect(entry).toMatchObject({ id: ride.id, name: 'Bike ride', minutes: 40, calories: 380, source: 'bike' });
        expect(rideDetail(entry.stats)).toBe('15.2 km · 158 W avg · 82 rpm');
    });

    it('are added once, and deleted from the bridge once they are in the saved diary', () => {
        const other = { ...ride, id: 'ride-1793400000', start: '2026-10-30T17:00:00+00:00' };
        const added = rideEntry(ride);
        const diary = [{ date: added.date, food: [], water: [], exercise: [added.entry] }];
        const plan = planRideSync([ride, other], diary);
        expect(plan.toDelete).toEqual([ride.id]);
        expect(plan.toAdd.map(el => el.entry.id)).toEqual([other.id]);
    });
});

describe('exercise cards', () => {
    const render = (element, diaryObj) => {
        const store = configureStore({
            reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer },
            preloadedState: { fDiary: { diaryObj, changed: false } },
        });
        return renderToString(<Provider store={store}>{element}</Provider>).replace(/<!-- -->/g, '');
    }
    const today = localDate();
    const diary = [{ date: today, food: [], water: [], exercise: [walk, { ...rideEntry(ride).entry }] }];

    it('show today in the diary with the bike numbers', () => {
        const html = render(<ExerciseDiary />, diary);
        expect(html).toContain('Exercise diary');
        expect(html).toContain('Bike ride');
        expect(html).toContain('from the bike');
        expect(html).toContain('15.2 km · 158 W avg · 82 rpm');
        expect(html).toContain('380');
    });

    it('show the week with today checked', () => {
        const html = render(<ExerciseWeek />, diary);
        expect(html).toContain('This week');
        expect(html).toContain('1 / 7');
        expect(html).toContain('380 kcal');
        expect(html).toContain('1 ride');
        expect(html).toContain('exercised, 1 h 10 min');
    });

    it('render empty', () => {
        expect(render(<ExerciseDiary />, [])).toContain('No exercise logged yet today.');
        expect(render(<ExerciseWeek />, [])).toContain('0 / 7');
    });
});
