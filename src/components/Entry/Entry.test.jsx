import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from '../store/ui-slice';
import weightSlice from '../store/weight-slice';
import foodDiarySlice, { foodDiaryActions } from '../store/food-diary-slice';
import recipeListSlice from '../store/recipe-list-slice';
import { customFood, migrateDiaryObj, migrateRecipeObj } from '../../assets/food';
import { formatDay, localDate, shiftDate } from '../../assets/functions';
import EntryCard from './EntryCard/EntryCard';
import FoodDiary from './FoodDiary';
import MacroList from './MacroList';
import PantryForm from './EntryCard/PantryForm';
import BuilderForm from './EntryCard/BuilderForm';
import LogForm from './EntryCard/LogForm';
import QuickEstimate, { EstimatePills } from './EntryCard/QuickEstimate';
import DayScore from './DayScore';

// Smoke tests: each screen renders with converted old data without throwing
const today = localDate();
const recipeObj = migrateRecipeObj({
    items: [{ id: 'Bar', name: 'Bar', calories: 200, tProtein: 10, tCarbs: 20, tFat: 8, ingredients: ['oats'] }],
    recipes: [{ id: 'Omelette', name: 'Omelette', ingredients: [{ fdcId: 1, description: 'Eggs, whole', foodNutrients: { protein: 12.6, fat: 9.5, carbs: 0.7, calories: 143 }, calculatedData: { servingSize: 150 } }] }],
});
recipeObj.meals.push({ id: 'm', name: 'Lunch', entries: [{ type: 'recipe', recipe: recipeObj.recipes[0], quantity: 1 }] });
const diaryObj = migrateDiaryObj([{ date: today, food: [{ name: 'Bar', calories: 200, tProtein: 10, tCarbs: 20, tFat: 8 }] }]);

const render = (element) => {
    const store = configureStore({
        reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer, recipes: recipeListSlice.reducer },
        preloadedState: { recipes: { recipeObj, changed: false }, fDiary: { diaryObj, changed: false } },
    });
    // Compare visible text; React separates adjacent text nodes with <!-- --> comments
    return renderToString(<Provider store={store}>{element}</Provider>).replace(/<!-- -->/g, '');
}

describe('Entry screens', () => {
    it('render the food lists, diary and totals', () => {
        expect(render(<EntryCard foodItems={recipeObj} onModal={() => { }} />)).toContain('Omelette');
        const diary = render(<FoodDiary />);
        expect(diary).toContain('Bar');
        expect(diary).toContain('1 serving');
        expect(render(<MacroList />)).toContain('200');
    });

    it('render the add, build and log forms', () => {
        expect(render(<PantryForm />)).toContain('Search USDA foods');
        expect(render(<BuilderForm kind="recipe" />)).toContain('Servings');
        expect(render(<BuilderForm kind="meal" />)).toContain('Omelette');
        const bar = customFood({ name: 'Bar', servingLabel: '1 bar', unit: 'g', servingAmount: 40, calories: 200, protein: 10, carbs: 20, fat: 8, ingredients: [] });
        expect(render(<LogForm list="items" entry={bar} />)).toContain('200<small>kcal</small>');
        // Recipes start in grams of the whole dish, estimated from the raw ingredients (150 g of egg)
        const omelette = render(<LogForm list="recipes" entry={recipeObj.recipes[0]} />);
        expect(omelette).toContain('Whole dish weighs');
        expect(omelette).toContain('value="150"');
    });
});

describe('Past days and estimates', () => {
    const yesterday = shiftDate(localDate(), -1);
    const renderWith = (element, diary, diaryDate) => {
        const store = configureStore({
            reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer, recipes: recipeListSlice.reducer },
            preloadedState: {
                recipes: { recipeObj, changed: false },
                fDiary: { diaryObj: diary, changed: false },
                ui: { ...uiSlice.getInitialState(), diaryDate },
            },
        });
        return renderToString(<Provider store={store}>{element}</Provider>).replace(/<!-- -->/g, '');
    }
    const pizza = { id: 'p', name: 'Pizza', amount: 'Rough estimate', estimate: true, macros: { calories: 1200, protein: 0, carbs: 0, fat: 0 } };
    const pastDiary = [{ date: yesterday, food: [pizza], water: [], untracked: true, macros: pizza.macros }];

    it('shows the day the diary is paged to, with its estimate and untracked note', () => {
        const html = renderWith(<FoodDiary />, pastDiary, yesterday);
        expect(html).toContain('Back to today');
        expect(html).toContain('≈ 1200');
        expect(html).toContain('Calories only');
        expect(html).toContain('left out of your calorie averages');
        expect(html).toContain('Count this day again');
        const totals = renderWith(<MacroList />, pastDiary, yesterday);
        expect(totals).toContain('Day totals');
        expect(totals).toContain('Missing macros for 1,200 kcal');
        expect(totals).toContain('Includes ≈ 1,200 kcal estimated');
    });

    it('logs to the day being viewed', () => {
        expect(renderWith(<LogForm list="recipes" entry={recipeObj.recipes[0]} />, [], yesterday)).toContain(`Adds to ${formatDay(yesterday)}`);
        expect(renderWith(<QuickEstimate preset={{ id: 'big', label: 'Big meal', calories: 1200 }} />, [], null)).toContain('value="1200"');
    });

    it('puts quick estimate pills on Meals', () => {
        expect(renderWith(<EstimatePills onPick={() => { }} />, [], null)).toContain('Feast');
    });

    it('keeps an untracked day with nothing logged, and lets it go when counted again', () => {
        let state = foodDiarySlice.reducer(undefined, foodDiaryActions.setUntracked({ date: yesterday, untracked: true }));
        expect(state.diaryObj[0]).toMatchObject({ date: yesterday, untracked: true, food: [] });
        expect(migrateDiaryObj(state.diaryObj)).toEqual(state.diaryObj);
        state = foodDiarySlice.reducer(state, foodDiaryActions.setUntracked({ date: yesterday, untracked: false }));
        expect(state.diaryObj).toEqual([]);
    });
});

describe('Day score', () => {
    const render = (diaryObj) => {
        const store = configureStore({
            reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer, recipes: recipeListSlice.reducer },
            preloadedState: {
                fDiary: { diaryObj, changed: false },
                weight: { weightObj: [{ date: '2026-10-01', lbs: 244, kgs: 110.7 }], changed: false },
                ui: { ...uiSlice.getInitialState(), userPreferences: { theme: { lightMode: 'light', themeName: 'teal' }, settings: {},
                    user: { height: { in: 70, cm: 178 }, birthday: '1990-01-01', activityLevel: 1.375, weightDeficit: { lbs: 1 }, sex: 'male' } } },
            },
        });
        return renderToString(<Provider store={store}><DayScore /></Provider>).replace(/<!-- -->/g, '');
    }

    it('grades the diary day with its stats', () => {
        const meal = { id: 'm', name: 'Chicken & rice', amount: '1', macros: { calories: 800, protein: 80, carbs: 80, fat: 18 } };
        const html = render([{ date: localDate(), food: [meal], water: [], macros: meal.macros }]);
        expect(html).toContain('so far');
        expect(html).toContain('good range');
        expect(html).toContain('Macro split');
        expect(html).toContain('On track');
    });

    it('asks for food when nothing is logged', () => {
        expect(render([])).toContain('Log food today to get a score');
    });
});
