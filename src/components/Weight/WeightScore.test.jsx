import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from '../store/ui-slice';
import weightSlice from '../store/weight-slice';
import foodDiarySlice from '../store/food-diary-slice';
import { localDate } from '../../assets/functions';
import { dateFromDay, dayNumber } from './weightRange';
import WeightScore from './WeightScore';
import WeightChart from './WeightChart';

// Smoke tests: the chart and score card render for each range without throwing
const today = dayNumber(localDate());
const weightObj = [-40, -20, -9, -6, -2, 0].map((ago, i) => ({ date: dateFromDay(today + ago), lbs: 245 - i, kgs: 111 - i / 2 }));

const render = (element) => {
    const store = configureStore({
        reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer },
        preloadedState: {
            weight: { weightObj, changed: false },
            fDiary: { diaryObj: [{ date: localDate(), food: [], macros: { calories: 1900, protein: 0, carbs: 0, fat: 0 } }], changed: false },
            ui: { ...uiSlice.getInitialState(), userPreferences: { theme: { lightMode: 'light' }, settings: {}, user: { weightDeficit: { lbs: 1 } } } },
        },
    });
    return renderToString(<Provider store={store}>{element}</Provider>).replace(/<!-- -->/g, '');
}

describe('Weight score', () => {
    it('grades a finished month and shows its stats', () => {
        const html = render(<WeightScore rangeId="month" offset={-1} />);
        expect(html).toContain('Weight score');
        expect(html).toContain('final score');
        expect(html).toContain('Lowest');
    });

    it('shows this week, and the year month by month', () => {
        expect(render(<WeightScore rangeId="week" offset={0} />)).toContain('in progress');
        expect(render(<WeightScore rangeId="year" offset={0} />)).toContain('Month by month');
    });

    it('puts period arrows on the week and month charts only', () => {
        expect(render(<WeightChart rangeId="week" offset={-1} />)).toContain('Back to this week');
        expect(render(<WeightChart rangeId="year" offset={0} />)).not.toContain('Previous');
    });
});
