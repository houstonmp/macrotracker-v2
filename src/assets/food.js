// Food data model
//
// Pantry food:  { id, name, source: 'usda' | 'custom', unit, nutrients: Macros, portions: [Portion], ... }
// Recipe:       { id, name, servings, instructions, img, ingredients: [FoodAmount] }
// Meal:         { id, name, entries: [FoodAmount & { type: 'food' } | { type: 'recipe', recipe, quantity }] }
// Diary entry:  { id, name, amount, macros: Macros }
//
// A food is measured in one unit: 'g', 'ml', or 'serving' for things with no weight or
// volume on the label ("1 bottle"). Its nutrients are per BASE_AMOUNT of that unit, and a
// Portion is { label, amount } with the amount in that same unit, so every calculation
// scales from one base. FoodAmount is { food, quantity, portion }; Macros is
// { calories, protein, carbs, fat }.
// Recipes and meals keep a copy of the foods they were built from, so deleting or
// renaming a pantry food never changes them.

export const UNITS = ['g', 'ml', 'serving'];
export const BASE_AMOUNT = { g: 100, ml: 100, serving: 1 };

// crypto.randomUUID is unavailable over plain http (e.g. a local Home Assistant address)
export const createId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const round = (value) => parseFloat(value.toFixed(2));

// Grams for display in tables: one decimal is plenty
export const formatGrams = (value) => Math.round(value * 10) / 10;

export const emptyMacros = () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });

export const scaleMacros = (macros, factor) => ({
    calories: round(macros.calories * factor),
    protein: round(macros.protein * factor),
    carbs: round(macros.carbs * factor),
    fat: round(macros.fat * factor),
});

export const sumMacros = (list) => list.reduce((total, macros) => ({
    calories: round(total.calories + macros.calories),
    protein: round(total.protein + macros.protein),
    carbs: round(total.carbs + macros.carbs),
    fat: round(total.fat + macros.fat),
}), emptyMacros());

// Logging by the food's own unit (1 g, 1 ml); 'serving' foods are logged by portion only
export const unitPortion = (food) => (food.unit === 'serving' ? null : { label: food.unit, amount: 1 });

export const amountOptions = (food) => [unitPortion(food), ...food.portions].filter(Boolean);

export const nutrientBasis = (food) => (food.unit === 'serving'
    ? `per ${food.portions.length > 0 ? food.portions[0].label : 'serving'}`
    : `per ${BASE_AMOUNT[food.unit]} ${food.unit}`);

export const foodMacros = (food, amount) => scaleMacros(food.nutrients, amount / BASE_AMOUNT[food.unit]);

export const portionAmount = (amount) => Number(amount.quantity) * amount.portion.amount;

export const foodAmountMacros = (amount) => foodMacros(amount.food, portionAmount(amount));

export const recipeTotalMacros = (recipe) => sumMacros(recipe.ingredients.map(foodAmountMacros));

export const recipeServingMacros = (recipe) => scaleMacros(recipeTotalMacros(recipe), 1 / (recipe.servings || 1));

// What a recipe's raw ingredients weigh together. Millilitres count as grams, close enough
// for broth or milk; foods measured only in servings have no weight, so `complete` is false.
export const recipeRawWeight = (recipe) => recipe.ingredients.reduce((total, ingredient) => (ingredient.food.unit === 'serving'
    ? { ...total, complete: false }
    : { ...total, grams: total.grams + portionAmount(ingredient) }), { grams: 0, complete: true });

// The whole dish in grams: the cooked weight if it's been weighed, otherwise the raw
// ingredients, which is only an estimate since cooking adds or loses water
export const recipeWeight = (recipe) => recipe.cookedWeight || Math.round(recipeRawWeight(recipe).grams);

export const recipeGramMacros = (recipe, grams, weight = recipeWeight(recipe)) => (weight > 0
    ? scaleMacros(recipeTotalMacros(recipe), grams / weight)
    : scaleMacros(recipeTotalMacros(recipe), 0));

export const mealEntryMacros = (entry) => entry.type === 'recipe'
    ? scaleMacros(recipeServingMacros(entry.recipe), Number(entry.quantity))
    : foodAmountMacros(entry);

export const mealTotalMacros = (meal) => sumMacros(meal.entries.map(mealEntryMacros));

// The amount a food is logged in by default: its first portion, otherwise 100 g / 100 ml
export const defaultAmount = (food) => food.portions.length > 0
    ? { quantity: 1, portion: food.portions[0] }
    : { quantity: BASE_AMOUNT[food.unit], portion: unitPortion(food) };

export const amountLabel = (amount) => (amount.portion.amount === 1 && ['g', 'ml'].includes(amount.portion.label)
    ? `${amount.quantity} ${amount.portion.label}`
    : `${amount.quantity} × ${amount.portion.label}`);

// Macros for one default serving of an entry in a food list ('items', 'recipes' or 'meals')
export const listEntryMacros = (list, entry) => {
    if (list === 'recipes') {
        return recipeServingMacros(entry);
    }
    if (list === 'meals') {
        return mealTotalMacros(entry);
    }
    return foodAmountMacros({ food: entry, ...defaultAmount(entry) });
}

// What the listEntryMacros numbers are for, shown under the name
export const listEntryBasis = (list, entry) => {
    if (list === 'recipes') {
        return 'per serving';
    }
    if (list === 'meals') {
        return 'whole meal';
    }
    return amountLabel(defaultAmount(entry));
}

export const ingredientNames = (list, entry) => {
    if (list === 'recipes') {
        return entry.ingredients.map(ing => ing.food.name);
    }
    if (list === 'meals') {
        return entry.entries.map(el => (el.type === 'recipe' ? el.recipe.name : el.food.name));
    }
    return entry.ingredients;
}

// A portion described in the food's unit, e.g. "1 bottle (500 ml)"
export const namedPortion = (label, amount, unit) => ({ label: `${label} (${amount} ${unit})`, amount });

// A food typed in from a nutrition label, which lists macros per serving. The serving is
// measured in g or ml when the label says so; otherwise the serving itself is the unit.
export const customFood = ({ name, servingLabel, unit, servingAmount, calories, protein, carbs, fat, ingredients }) => {
    const label = servingLabel || '1 serving';
    const macros = { calories, protein, carbs, fat };
    const food = { id: createId(), name, source: 'custom', unit, ingredients, missing: [] };

    if (unit === 'serving') {
        return { ...food, nutrients: scaleMacros(macros, 1), portions: [{ label, amount: 1 }] };
    }
    return { ...food, nutrients: scaleMacros(macros, BASE_AMOUNT[unit] / servingAmount), portions: [namedPortion(label, servingAmount, unit)] };
}

// ---- Loading saved data ----
// Firebase drops empty arrays, so every list is defaulted on load. Records saved in older
// formats are converted; converting a record that is already current changes nothing.

const toNumber = (value) => (Number.isFinite(Number(value)) && value !== null ? Number(value) : 0);

const GRAMS = { label: 'g', amount: 1 };

// The previous format measured every portion in grams
const migratePortion = (portion) => (portion.amount === undefined ? { label: portion.label, amount: portion.grams } : portion);

const migrateFood = (food) => {
    // Previous format: grams only, nutrients under per100g
    const { per100g, ...rest } = food;
    const current = food.nutrients ? food : { ...rest, unit: 'g', nutrients: per100g };
    return {
        ...current,
        portions: (current.portions || []).map(migratePortion),
        ingredients: current.ingredients || [],
        missing: current.missing || [],
    };
}

const migrateFoodAmount = (amount) => ({ ...amount, food: migrateFood(amount.food), portion: migratePortion(amount.portion) });

const migrateCurrentRecipe = (recipe) => ({ ...recipe, ingredients: (recipe.ingredients || []).map(migrateFoodAmount) });

const migrateMeal = (meal) => ({
    ...meal,
    entries: (meal.entries || []).map(el => (el.type === 'recipe'
        ? { ...el, recipe: migrateCurrentRecipe(el.recipe) }
        : migrateFoodAmount(el))),
});

// The original custom items held one serving's macros with no weight, so the serving is the unit
const migrateOriginalItem = (item) => ({
    id: createId(),
    name: item.name,
    source: 'custom',
    unit: 'serving',
    nutrients: { calories: toNumber(item.calories), protein: toNumber(item.tProtein), carbs: toNumber(item.tCarbs), fat: toNumber(item.tFat) },
    portions: [{ label: '1 serving', amount: 1 }],
    ingredients: (item.ingredients || []).filter(Boolean),
    missing: [],
});

// The original USDA ingredients kept the search result's nutrients (per 100 g) under foodNutrients
const migrateOriginalUsdaIngredient = (ing) => {
    const nutrients = ing.foodNutrients || {};
    const keys = ['calories', 'protein', 'carbs', 'fat'];
    return {
        food: {
            id: createId(),
            name: ing.description,
            source: 'usda',
            fdcId: ing.fdcId,
            dataType: ing.dataType || '',
            brand: ing.brandName || '',
            unit: 'g',
            nutrients: Object.fromEntries(keys.map(key => [key, Math.max(toNumber(nutrients[key]), 0)])),
            portions: [],
            ingredients: [],
            missing: keys.filter(key => nutrients[key] === undefined || nutrients[key] === null),
        },
        quantity: toNumber(ing.calculatedData && ing.calculatedData.servingSize),
        portion: GRAMS,
    };
}

const migrateOriginalRecipe = (recipe) => ({
    id: createId(),
    name: recipe.name,
    servings: 1,
    instructions: recipe.instructions || '',
    img: recipe.img || '',
    ingredients: (recipe.ingredients || []).filter(ing => ing && ing.fdcId).map(migrateOriginalUsdaIngredient),
});

const isOriginalFood = (food) => !food.nutrients && !food.per100g;

export const migrateRecipeObj = (recipeObj = {}) => ({
    items: (recipeObj.items || []).map(item => (isOriginalFood(item) ? migrateOriginalItem(item) : migrateFood(item))),
    recipes: (recipeObj.recipes || []).map(recipe => (recipe.servings ? migrateCurrentRecipe(recipe) : migrateOriginalRecipe(recipe))),
    // Meals had no way to be created originally, so only current-format meals exist
    meals: (recipeObj.meals || []).filter(meal => meal.entries).map(migrateMeal),
});

// Old diary entries were copies of the item or recipe, with t-prefixed totals
const migrateDiaryEntry = (entry) => (entry.macros ? entry : {
    id: createId(),
    name: entry.name,
    amount: '1 serving',
    macros: { calories: toNumber(entry.calories), protein: toNumber(entry.tProtein), carbs: toNumber(entry.tCarbs), fat: toNumber(entry.tFat) },
});

export const migrateDiaryObj = (diaryObj = []) => diaryObj
    .map(day => {
        const food = (day.food || []).map(migrateDiaryEntry);
        // Firebase drops empty arrays, so a day without water comes back without the key
        const water = (day.water || []).filter(entry => entry && entry.ml > 0);
        const migrated = { date: day.date, food, water, macros: sumMacros(food.map(entry => entry.macros)) };
        const exercise = (day.exercise || []).filter(entry => entry && entry.name);
        if (exercise.length > 0) {
            migrated.exercise = exercise;
        }
        return day.untracked ? { ...migrated, untracked: true } : migrated;
    })
    .filter(day => day.food.length > 0 || day.water.length > 0 || day.exercise || day.untracked);

// Typical shares of calories from protein, carbs and fat for food you can't weigh, so a
// quick estimate still lands in your macros. Rough averages of common takeout.
export const ESTIMATE_TYPES = [
    { id: 'pizza', label: 'Pizza', split: { protein: 0.17, carbs: 0.45, fat: 0.38 } },
    { id: 'burger', label: 'Burger & fries', split: { protein: 0.15, carbs: 0.4, fat: 0.45 } },
    { id: 'mexican', label: 'Mexican', split: { protein: 0.18, carbs: 0.47, fat: 0.35 } },
    { id: 'asian', label: 'Asian takeout', split: { protein: 0.15, carbs: 0.55, fat: 0.3 } },
    { id: 'fried', label: 'Fried chicken & wings', split: { protein: 0.3, carbs: 0.2, fat: 0.5 } },
    { id: 'pasta', label: 'Pasta', split: { protein: 0.15, carbs: 0.55, fat: 0.3 } },
    { id: 'dessert', label: 'Dessert & sweets', split: { protein: 0.05, carbs: 0.55, fat: 0.4 } },
    { id: 'drinks', label: 'Drinks', split: { protein: 0, carbs: 1, fat: 0 } },
];

// Grams from a share of calories: 4 kcal per gram of protein or carbs, 9 of fat
export const estimateMacros = (calories, typeId) => {
    const type = ESTIMATE_TYPES.find(el => el.id === typeId);
    if (!type) {
        return { calories, protein: 0, carbs: 0, fat: 0 };
    }
    return {
        calories,
        protein: Math.round(calories * type.split.protein / 4),
        carbs: Math.round(calories * type.split.carbs / 4),
        fat: Math.round(calories * type.split.fat / 9),
    };
}

// Calories in a day's diary that have no protein, carbs or fat behind them: estimates
// logged without a food type. The macro totals are short by this much.
export const unsplitCalories = (day) => (day ? day.food : [])
    .filter(entry => entry.estimate && !entry.estimateType)
    .reduce((sum, entry) => sum + entry.macros.calories, 0);

// Calories from estimates with a food type: their macros are a rough split
export const splitEstimateCalories = (day) => (day ? day.food : [])
    .filter(entry => entry.estimate && entry.estimateType)
    .reduce((sum, entry) => sum + entry.macros.calories, 0);
