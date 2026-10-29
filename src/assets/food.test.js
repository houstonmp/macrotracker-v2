import { describe, expect, it } from 'vitest';
import {
    amountLabel, amountOptions, customFood, defaultAmount, foodAmountMacros, ingredientNames, listEntryBasis, listEntryMacros,
    mealTotalMacros, migrateDiaryObj, migrateRecipeObj, nutrientBasis, recipeGramMacros, recipeRawWeight, recipeServingMacros,
    recipeTotalMacros, recipeWeight, estimateMacros, unsplitCalories, splitEstimateCalories,
} from './food';

const GRAM = { label: 'g', amount: 1 };
const egg = { id: 'egg', name: 'Eggs', source: 'usda', unit: 'g', nutrients: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 }, portions: [{ label: '1 large egg (50 g)', amount: 50 }], ingredients: [], missing: [] };
const oats = { id: 'oats', name: 'Oats', source: 'usda', unit: 'g', nutrients: { calories: 379, protein: 13.2, carbs: 67.7, fat: 6.5 }, portions: [], ingredients: [], missing: [] };
const bar = customFood({ name: 'Protein Bar', servingLabel: '1 bar', unit: 'g', servingAmount: 40, calories: 200, protein: 10, carbs: 20, fat: 8, ingredients: ['oats'] });

const recipe = {
    id: 'r1', name: 'Breakfast bake', servings: 2, instructions: '', img: '',
    ingredients: [{ food: egg, quantity: 2, portion: egg.portions[0] }, { food: oats, quantity: 100, portion: GRAM }],
};

describe('custom foods', () => {
    it('stores a weighed label serving per 100 g and gets it back for one serving', () => {
        expect(bar.nutrients).toEqual({ calories: 500, protein: 25, carbs: 50, fat: 20 });
        expect(bar.portions).toEqual([{ label: '1 bar (40 g)', amount: 40 }]);
        expect(foodAmountMacros({ food: bar, ...defaultAmount(bar) })).toEqual({ calories: 200, protein: 10, carbs: 20, fat: 8 });
    });

    it('stores a liquid per 100 ml and logs it in ml or by the bottle', () => {
        const shake = customFood({ name: 'Shake', servingLabel: '1 bottle', unit: 'ml', servingAmount: 500, calories: 300, protein: 30, carbs: 25, fat: 9, ingredients: [] });
        expect(shake.nutrients).toEqual({ calories: 60, protein: 6, carbs: 5, fat: 1.8 });
        expect(amountOptions(shake).map(el => el.label)).toEqual(['ml', '1 bottle (500 ml)']);
        expect(foodAmountMacros({ food: shake, quantity: 250, portion: { label: 'ml', amount: 1 } }).calories).toBe(150);
        expect(nutrientBasis(shake)).toBe('per 100 ml');
    });

    it('uses the serving itself as the unit when the label has no weight', () => {
        const drink = customFood({ name: 'Energy drink', servingLabel: '1 bottle', unit: 'serving', servingAmount: 0, calories: 110, protein: 0, carbs: 27, fat: 0, ingredients: [] });
        expect(drink.nutrients).toEqual({ calories: 110, protein: 0, carbs: 27, fat: 0 });
        expect(amountOptions(drink)).toEqual([{ label: '1 bottle', amount: 1 }]);
        expect(foodAmountMacros({ food: drink, quantity: 2, portion: drink.portions[0] }).calories).toBe(220);
        expect(nutrientBasis(drink)).toBe('per 1 bottle');
    });
});

describe('macro calculations', () => {
    it('defaults to 100 of the unit when a food has no portions', () => {
        expect(defaultAmount(oats)).toEqual({ quantity: 100, portion: GRAM });
    });

    it('totals a recipe and divides it into servings', () => {
        expect(recipeTotalMacros(recipe)).toEqual({ calories: 522, protein: 25.8, carbs: 68.4, fat: 16 });
        expect(recipeServingMacros(recipe)).toEqual({ calories: 261, protein: 12.9, carbs: 34.2, fat: 8 });
    });

    it('totals a meal of recipe servings and pantry foods', () => {
        const meal = { id: 'm1', name: 'Breakfast', entries: [{ type: 'recipe', recipe, quantity: 1 }, { type: 'food', food: bar, quantity: 1, portion: bar.portions[0] }] };
        expect(mealTotalMacros(meal).calories).toBe(461);
        expect(listEntryMacros('meals', meal).calories).toBe(461);
        expect(ingredientNames('meals', meal)).toEqual(['Breakfast bake', 'Protein Bar']);
    });

    it('describes what a list row\'s macros are for', () => {
        expect(listEntryBasis('items', egg)).toBe('1 × 1 large egg (50 g)');
        expect(listEntryBasis('recipes', recipe)).toBe('per serving');
        expect(listEntryBasis('meals', { entries: [] })).toBe('whole meal');
    });

    it('labels amounts', () => {
        expect(amountLabel({ quantity: 150, portion: GRAM })).toBe('150 g');
        expect(amountLabel({ quantity: 250, portion: { label: 'ml', amount: 1 } })).toBe('250 ml');
        expect(amountLabel({ quantity: 2, portion: egg.portions[0] })).toBe('2 × 1 large egg (50 g)');
    });
});

describe('recipes by weight', () => {
    const rice = customFood({ name: 'Rice, dry', unit: 'g', servingAmount: 100, calories: 360, protein: 7, carbs: 80, fat: 1, ingredients: [] });
    const broth = customFood({ name: 'Broth', unit: 'ml', servingAmount: 100, calories: 10, protein: 1, carbs: 1, fat: 0, ingredients: [] });
    const bar = customFood({ name: 'Bar', unit: 'serving', calories: 200, protein: 10, carbs: 20, fat: 8, ingredients: [] });
    const pilaf = {
        servings: 4,
        ingredients: [
            { food: rice, quantity: 200, portion: { label: 'g', amount: 1 } },
            { food: broth, quantity: 400, portion: { label: 'ml', amount: 1 } },
        ],
    };

    it('adds up the raw ingredients, counting ml as grams', () => {
        expect(recipeRawWeight(pilaf)).toEqual({ grams: 600, complete: true });
        expect(recipeRawWeight({ ingredients: [...pilaf.ingredients, { food: bar, quantity: 1, portion: bar.portions[0] }] }).complete).toBe(false);
    });

    it('prefers the weighed cooked dish over the raw estimate', () => {
        expect(recipeWeight(pilaf)).toBe(600);
        expect(recipeWeight({ ...pilaf, cookedWeight: 900 })).toBe(900);
    });

    it('scales the whole recipe by the grams eaten', () => {
        // 760 kcal in the pot; 900 g cooked, 300 g eaten is a third
        expect(recipeGramMacros({ ...pilaf, cookedWeight: 900 }, 300).calories).toBeCloseTo(253.33, 1);
        expect(recipeGramMacros(pilaf, 150, 0).calories).toBe(0);
    });
});

describe('migrating saved data', () => {
    const originalRecipeObj = {
        items: [{ id: 'Bar', name: 'Bar', calories: 200, tProtein: 10, tCarbs: 20, tFat: 8, ingredients: ['oats', ''] }],
        recipes: [{
            id: 'Omelette', name: 'Omelette', instructions: 'Whisk', img: '', calories: 0, tProtein: 0, tCarbs: 0, tFat: 0,
            ingredients: [
                { fdcId: 1, description: 'Eggs', dataType: 'SR Legacy', foodNutrients: { protein: 12.6, fat: 9.5, carbs: 0.7, calories: 143 }, calculatedData: { servingSize: '150' } },
                // Foundation foods were read without calories
                { fdcId: 2, description: 'Spinach', dataType: 'Foundation', foodNutrients: { protein: 2.9, fat: 0.4, carbs: 3.6 }, calculatedData: { servingSize: 30 } },
            ],
        }],
    };

    it('converts original custom items to one-serving foods', () => {
        const { items } = migrateRecipeObj(originalRecipeObj);
        expect(items[0]).toMatchObject({ unit: 'serving', nutrients: { calories: 200, protein: 10, carbs: 20, fat: 8 }, portions: [{ label: '1 serving', amount: 1 }] });
        expect(items[0].ingredients).toEqual(['oats']);
        expect(listEntryMacros('items', items[0]).calories).toBe(200);
    });

    it('converts original recipes using the grams that were entered', () => {
        const [omelette] = migrateRecipeObj(originalRecipeObj).recipes;
        expect(omelette.servings).toBe(1);
        expect(omelette.ingredients.map(ing => [ing.food.name, ing.food.unit, ing.quantity])).toEqual([['Eggs', 'g', 150], ['Spinach', 'g', 30]]);
        expect(omelette.ingredients[1].food.missing).toEqual(['calories']);
        expect(recipeServingMacros(omelette).calories).toBe(214.5);
    });

    it('converts the grams-only format, portions included', () => {
        const gramsOnlyEgg = { id: 'e', name: 'Eggs', source: 'usda', per100g: egg.nutrients, portions: [{ label: '1 large egg (50 g)', grams: 50 }], ingredients: [], missing: [] };
        const saved = {
            items: [gramsOnlyEgg],
            recipes: [{ id: 'r', name: 'Eggs x2', servings: 1, ingredients: [{ food: gramsOnlyEgg, quantity: 2, portion: { label: '1 large egg (50 g)', grams: 50 } }] }],
            meals: [{ id: 'm', name: 'M', entries: [{ type: 'food', food: gramsOnlyEgg, quantity: 100, portion: { label: 'g', grams: 1 } }] }],
        };
        const { items, recipes, meals } = migrateRecipeObj(saved);
        expect(items[0]).toEqual({ ...egg, id: 'e' });
        expect(items[0].per100g).toBeUndefined();
        expect(recipes[0].ingredients[0].portion).toEqual({ label: '1 large egg (50 g)', amount: 50 });
        expect(recipeServingMacros(recipes[0]).calories).toBe(143);
        expect(meals[0].entries[0].portion).toEqual(GRAM);
    });

    it('leaves already-converted data unchanged', () => {
        const once = migrateRecipeObj(originalRecipeObj);
        expect(migrateRecipeObj(once)).toEqual(once);
    });

    it('restores arrays Firebase dropped because they were empty', () => {
        const saved = { items: [{ ...oats, portions: undefined, ingredients: undefined, missing: undefined }], recipes: [{ ...recipe, ingredients: undefined }] };
        const { items, recipes, meals } = migrateRecipeObj(saved);
        expect(items[0].portions).toEqual([]);
        expect(recipes[0].ingredients).toEqual([]);
        expect(meals).toEqual([]);
    });

    it('converts old diary entries and recalculates the day', () => {
        const diary = migrateDiaryObj([
            { date: '2026-10-01', food: [{ name: 'Bar', calories: 200, tProtein: 10, tCarbs: 20, tFat: 8 }, { name: 'Spinach', calories: null, tProtein: 5 }], macros: {} },
            { date: '2026-10-02' },
        ]);
        expect(diary).toHaveLength(1);
        expect(diary[0].food[1]).toMatchObject({ name: 'Spinach', amount: '1 serving', macros: { calories: 0, protein: 5, carbs: 0, fat: 0 } });
        expect(diary[0].macros).toEqual({ calories: 200, protein: 15, carbs: 20, fat: 8 });
        expect(migrateDiaryObj(diary)).toEqual(diary);
    });
});

describe('quick estimates', () => {
    it('splits calories by the kind of food', () => {
        // Pizza: 17% protein, 45% carbs, 38% fat of 1200 kcal
        expect(estimateMacros(1200, 'pizza')).toEqual({ calories: 1200, protein: 51, carbs: 135, fat: 51 });
        expect(estimateMacros(500, 'unknown')).toEqual({ calories: 500, protein: 0, carbs: 0, fat: 0 });
    });

    it('counts the calories the macro totals are missing', () => {
        const day = { food: [
            { estimate: true, macros: { calories: 800 } },
            { estimate: true, estimateType: 'pizza', macros: { calories: 600 } },
            { macros: { calories: 300 } },
        ] };
        expect(unsplitCalories(day)).toBe(800);
        expect(splitEstimateCalories(day)).toBe(600);
        expect(unsplitCalories(null)).toBe(0);
    });
});
