import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import foodDiarySlice, { foodDiaryActions } from './food-diary-slice';
import recipeListSlice, { recipeListActions } from './recipe-list-slice';
import weightSlice, { weightActions } from './weight-slice';
import { selectDailyTargets, selectLatestWeight } from './selectors';

const macros = (calories, protein, carbs, fat) => ({ calories, protein, carbs, fat });

describe('food diary', () => {
    it('adds entries to a day and removes them by id', () => {
        let state = foodDiarySlice.reducer(undefined, { type: 'init' });
        state = foodDiarySlice.reducer(state, foodDiaryActions.addFood({ date: '2026-10-27', entry: { id: 'a', name: 'A', amount: '1 g', macros: macros(100.1, 10, 5, 2) } }));
        state = foodDiarySlice.reducer(state, foodDiaryActions.addFood({ date: '2026-10-27', entry: { id: 'b', name: 'B', amount: '1 g', macros: macros(200.2, 20, 10, 4) } }));
        expect(state.diaryObj[0].macros).toEqual(macros(300.3, 30, 15, 6));

        state = foodDiarySlice.reducer({ ...state, changed: false }, foodDiaryActions.removeFood({ date: '2026-10-27', id: 'a' }));
        expect(state.diaryObj[0].food.map(el => el.id)).toEqual(['b']);
        expect(state.diaryObj[0].macros).toEqual(macros(200.2, 20, 10, 4));
        expect(state.changed).toBe(true);

        state = foodDiarySlice.reducer(state, foodDiaryActions.removeFood({ date: '2026-10-27', id: 'b' }));
        expect(state.diaryObj).toEqual([]);
    });
});

describe('food lists', () => {
    it('adds and removes entries in the named list only', () => {
        let state = recipeListSlice.reducer(undefined, { type: 'init' });
        state = recipeListSlice.reducer(state, recipeListActions.addEntry({ list: 'items', data: { id: 'x', name: 'X' } }));
        state = recipeListSlice.reducer(state, recipeListActions.addEntry({ list: 'nope', data: { id: 'y' } }));
        expect(state.recipeObj.items).toEqual([{ id: 'x', name: 'X' }]);

        state = recipeListSlice.reducer(state, recipeListActions.removeEntry({ list: 'items', id: 'x' }));
        expect(state.recipeObj).toEqual({ items: [], recipes: [], meals: [] });
    });
});

describe('weight', () => {
    it('stores numbers whichever unit was entered', () => {
        let state = weightSlice.reducer(undefined, { type: 'init' });
        state = weightSlice.reducer(state, weightActions.updateWeight({ date: '2026-10-01', value: '100', unit: 'kgs' }));
        state = weightSlice.reducer(state, weightActions.updateWeight({ date: '2026-10-08', value: '220.46', unit: 'lbs' }));
        expect(state.weightObj).toEqual([{ date: '2026-10-01', kgs: 100, lbs: 220.46 }, { date: '2026-10-08', kgs: 100, lbs: 220.46 }]);

        state = weightSlice.reducer(state, weightActions.removeWeight({ date: '2026-10-01' }));
        expect(state.weightObj.map(el => el.date)).toEqual(['2026-10-08']);
    });
});

describe('selectDailyTargets', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 27));
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    const user = { height: { in: 72, cm: 182.88 }, birthday: '1990-01-01', activityLevel: 1.2, weightDeficit: { lbs: 1, kgs: 0.45 }, sex: 'male' };
    const state = (profile, weightObj) => ({ ui: { userPreferences: { user: profile } }, weight: { weightObj } });

    it('uses the most recent weigh-in, not the last one in the list', () => {
        const weights = [{ date: '2026-10-20', kgs: 120, lbs: 264.55 }, { date: '2026-09-01', kgs: '130', lbs: '286.6' }];
        expect(selectLatestWeight(state(user, weights)).date).toBe('2026-10-20');

        const targets = selectDailyTargets(state(user, weights));
        expect(targets.age).toBe(36);
        expect(targets.BMR).toBe(2168);
        expect(targets.TDEEValue).toBe(2601);
        expect(targets.dailyMacros.goalCalories).toBe(2101);
    });

    it('returns nothing until there is a weight and a complete profile', () => {
        expect(selectDailyTargets(state(user, []))).toBeNull();
        expect(selectDailyTargets(state({ ...user, birthday: undefined }, [{ date: '2026-10-20', kgs: 120 }]))).toBeNull();
    });
});
