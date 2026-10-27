import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiSlice from '../store/ui-slice';
import weightSlice from '../store/weight-slice';
import foodDiarySlice from '../store/food-diary-slice';
import recipeListSlice from '../store/recipe-list-slice';
import { customFood, migrateDiaryObj, migrateRecipeObj } from '../../assets/food';
import EntryCard from './EntryCard/EntryCard';
import FoodDiary from './FoodDiary';
import MacroList from './MacroList';
import PantryForm from './EntryCard/PantryForm';
import BuilderForm from './EntryCard/BuilderForm';
import LogForm from './EntryCard/LogForm';

// Smoke tests: each screen renders with converted old data without throwing
const today = new Date().toJSON().slice(0, 10);
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
        expect(render(<LogForm list="items" entry={bar} />)).toContain('200 kcal');
        expect(render(<LogForm list="recipes" entry={recipeObj.recipes[0]} />)).toContain('servings');
    });
});
