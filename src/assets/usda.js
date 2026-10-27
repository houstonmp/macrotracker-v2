import { createId, namedPortion, round } from './food';

const API_URL = 'https://api.nal.usda.gov/fdc/v1';

// 'Generic' covers USDA's lab-analysed whole foods; the other two are much noisier
export const DATA_TYPES = {
    Generic: 'Foundation,SR Legacy',
    Branded: 'Branded',
    Survey: 'Survey (FNDDS)',
};

// Nutrient numbers in order of preference. Foundation foods report energy as 957/958
// (Atwater factors) instead of 208; 268 is energy in kJ.
const NUTRIENTS = {
    calories: ['208', '958', '957'],
    protein: ['203'],
    carbs: ['205'],
    fat: ['204'],
};
const KJ_PER_KCAL = 4.184;

// Branded serving units; anything that isn't millilitres is treated as grams
const ML_UNITS = ['MLT', 'ml', 'ML'];

const nutrientValue = (nutrients, numbers) => {
    for (const number of numbers) {
        const match = nutrients.find(n => n.nutrientNumber === number);
        if (match && match.value !== undefined && match.value !== null) {
            return match.value;
        }
    }
    return null;
}

// Search results report every nutrient per 100 g, or per 100 ml for liquids, branded foods included
export const normalizeUsdaFood = (food) => {
    const nutrients = food.foodNutrients || [];
    const values = Object.fromEntries(Object.entries(NUTRIENTS).map(([key, numbers]) => [key, nutrientValue(nutrients, numbers)]));
    const kilojoules = nutrientValue(nutrients, ['268']);
    if (values.calories === null && kilojoules !== null) {
        values.calories = kilojoules / KJ_PER_KCAL;
    }

    const unit = ML_UNITS.includes(food.servingSizeUnit) ? 'ml' : 'g';
    const portions = [];
    if (food.servingSize) {
        portions.push(namedPortion(food.householdServingFullText || 'serving', round(food.servingSize), unit));
    }

    return {
        id: createId(),
        name: food.description,
        source: 'usda',
        fdcId: food.fdcId,
        dataType: food.dataType,
        brand: food.brandName || food.brandOwner || '',
        unit,
        // Lab values can come back slightly negative (e.g. carbs "by difference")
        nutrients: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, round(Math.max(value || 0, 0))])),
        portions,
        ingredients: [],
        missing: Object.keys(values).filter(key => values[key] === null),
    };
}

const portionLabel = (portion) => {
    if (portion.portionDescription && portion.portionDescription !== 'Quantity not specified') {
        return portion.portionDescription;
    }
    const unit = portion.measureUnit && portion.measureUnit.name;
    const parts = [portion.amount || 1];
    if (unit && unit !== 'undetermined') {
        parts.push(unit === 'RACC' ? 'serving' : unit);
    }
    if (portion.modifier) {
        parts.push(portion.modifier);
    }
    return parts.join(' ');
}

export const normalizeUsdaPortions = (foodPortions = []) => foodPortions
    .filter(portion => portion.gramWeight > 0)
    .map(portion => namedPortion(portionLabel(portion), round(portion.gramWeight), 'g'));

const request = async (path, params) => {
    const query = new URLSearchParams({ api_key: import.meta.env.VITE_USDA_KEY, ...params });
    const response = await fetch(`${API_URL}${path}?${query}`);
    if (!response.ok) {
        throw new Error('Could not reach the USDA food database');
    }
    return response.json();
}

export const searchUsda = async (query, dataType) => {
    const data = await request('/foods/search', { query, dataType: DATA_TYPES[dataType], pageSize: 25 });
    return data.foods.map(normalizeUsdaFood);
}

// Household portions ("1 large egg") are only on the food's detail record, always in grams
export const fetchUsdaPortions = async (fdcId) => {
    const data = await request(`/food/${fdcId}`, {});
    return normalizeUsdaPortions(data.foodPortions);
}
