import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from '../store/ui-slice';
import weightSlice from '../store/weight-slice';
import foodDiarySlice, { foodDiaryActions } from '../store/food-diary-slice';
import { migrateDiaryObj } from '../../assets/food';
import { localDate } from '../../assets/functions';
import { litres, toMl, waterGoal, waterTotal } from './water';
import WaterCard from './WaterCard';

const reduce = (actions, state = foodDiarySlice.getInitialState()) => actions.reduce(foodDiarySlice.reducer, state);

describe('water goal', () => {
    it('is 33 ml per kg, rounded to 50 ml', () => {
        // 244 lbs is 110.7 kg
        expect(waterGoal(110.7)).toBe(3650);
        expect(waterGoal(undefined)).toBe(null);
    });

    it('converts and labels amounts', () => {
        expect(toMl(16.9, 'oz')).toBe(500);
        expect(toMl(330, 'ml')).toBe(330);
        expect(litres(2250)).toBe('2.25 L');
        expect(litres(2000)).toBe('2 L');
    });
});

describe('water in the diary', () => {
    const cup = { id: 'c1', kind: 'cup', ml: 240 };

    it('starts a day for water alone and removes it once empty', () => {
        let state = reduce([foodDiaryActions.addWater({ date: '2026-10-28', entry: cup })]);
        expect(state.diaryObj).toEqual([{ date: '2026-10-28', food: [], water: [cup], macros: { calories: 0, protein: 0, carbs: 0, fat: 0 } }]);
        expect(waterTotal(state.diaryObj[0])).toBe(240);
        state = reduce([foodDiaryActions.removeWater({ date: '2026-10-28', id: 'c1' })], state);
        expect(state.diaryObj).toEqual([]);
    });

    it('keeps the day when the last food goes but water is left', () => {
        const entry = { id: 'f1', name: 'Bar', amount: '1 bar', macros: { calories: 200, protein: 10, carbs: 20, fat: 8 } };
        const state = reduce([
            foodDiaryActions.addFood({ date: '2026-10-28', entry }),
            foodDiaryActions.addWater({ date: '2026-10-28', entry: cup }),
            foodDiaryActions.removeFood({ date: '2026-10-28', id: 'f1' }),
        ]);
        expect(state.diaryObj[0]).toMatchObject({ food: [], water: [cup], macros: { calories: 0 } });
    });

    it('survives Firebase dropping the empty arrays', () => {
        expect(migrateDiaryObj([{ date: '2026-10-28', water: [cup], macros: {} }])[0]).toMatchObject({ food: [], water: [cup] });
        expect(migrateDiaryObj([{ date: '2026-10-28', food: [{ id: 'a', name: 'Bar', amount: '1', macros: { calories: 1, protein: 0, carbs: 0, fat: 0 } }] }])[0].water).toEqual([]);
    });
});

describe('WaterCard', () => {
    const render = (diaryObj, weightObj) => {
        const store = configureStore({
            reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer },
            preloadedState: { weight: { weightObj, changed: false }, fDiary: { diaryObj, changed: false } },
        });
        return renderToString(<Provider store={store}><WaterCard /></Provider>).replace(/<!-- -->/g, '');
    }

    it('shows the share of the goal, the cups and exact amounts', () => {
        const html = render([{ date: localDate(), food: [], macros: {}, water: [
            { id: 'a', kind: 'cup', ml: 240 }, { id: 'b', kind: 'cup', ml: 240 }, { id: 'c', kind: 'exact', ml: 500, label: '16.9 fl oz' },
        ] }], [{ date: '2026-10-01', lbs: 244, kgs: 110.7 }]);
        // 980 of 3650 ml
        expect(html).toContain('27%');
        expect(html).toContain('0.98 L of 3.65 L');
        expect(html).toContain('2 cups');
        expect(html).toContain('16.9 fl oz');
    });

    it('works before the first weigh-in', () => {
        expect(render([], [])).toContain('Log a weigh-in to get a goal');
    });
});
