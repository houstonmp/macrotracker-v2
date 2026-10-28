import { describe, expect, it } from 'vitest';
import { findMeasure, mealieMeasure, singular, normalizeFractions, pantryMatch, parseNumber, rankUsda, readLine, suggestAmount, usdaQuery } from './ingredients';
import { customFood, namedPortion } from '../../assets/food';

// What Mealie's parser returns, in the shapes seen in real recipes
const parsed = (quantity, unit, food, note = '', confidence = 1) => ({
    quantity, unit: unit && { name: unit }, food: food && { name: food }, note, confidence,
});

const usdaFood = (name, portions, unit = 'g') => ({
    id: name, name, source: 'usda', unit, nutrients: { calories: 100, protein: 1, carbs: 1, fat: 1 }, portions, missing: [],
});

describe('reading amounts', () => {
    it('handles the fraction styles recipes use', () => {
        expect(normalizeFractions('14 ¹/₂ ounce')).toBe('14 1/2 ounce');
        expect(normalizeFractions('1½ cups')).toBe('1 1/2 cups');
        expect(parseNumber('14 1/2')).toBe(14.5);
        expect(parseNumber('¾')).toBe(0.75);
        expect(parseNumber('salt')).toBeNull();
    });

    it('finds a weight or volume anywhere in the text', () => {
        expect(findMeasure('or 15 ounce')).toEqual({ amount: 425.3, unit: 'g', text: '15 ounce' });
        expect(findMeasure('1 (14 ¹/₂ oz) can tomatoes')).toMatchObject({ amount: 411.1, unit: 'g' });
        expect(findMeasure('400g pasta')).toMatchObject({ amount: 400, unit: 'g' });
        expect(findMeasure('1 (32 fl. oz) carton broth')).toMatchObject({ amount: 946.2, unit: 'ml' });
        expect(findMeasure('2 large eggs')).toBeNull();
    });
});

describe('readLine', () => {
    it('prefers the weight in the note over "1 can"', () => {
        const line = readLine(parsed(1, 'can', 'chickpea', 'or 15 ounce'), '1 can chickpea or 15 ounce');
        expect(line.measure).toMatchObject({ amount: 425.3, unit: 'g' });
        expect(line.skip).toBe(false);
    });

    it('turns a weight unit into grams', () => {
        expect(readLine(parsed(2, 'pound', 'ground beef'), '2 lb ground beef').measure).toMatchObject({ amount: 907.2, unit: 'g' });
    });

    it('treats a missing amount as missing, not zero', () => {
        expect(readLine(parsed(0, null, 'olive oil', 'or avocado oil'), 'olive oil or avocado oil').quantity).toBeNull();
    });

    it("doesn't count salt, pepper, water or things to taste", () => {
        expect(readLine(parsed(1, 'pinch', 'salt & pepper'), '1 pinch salt & pepper').skip).toBe(true);
        expect(readLine(parsed(0, null, 'salt', 'or pepper to taste'), 'salt and pepper to taste').skip).toBe(true);
        expect(readLine(parsed(4, 'cup', 'water'), '4 cups water').skip).toBe(true);
    });
});

describe('pantryMatch', () => {
    const pantry = [
        customFood({ name: 'Egg noodles, cooked, enriched', unit: 'g', servingAmount: 100, calories: 138, protein: 4.5, carbs: 25, fat: 2, ingredients: [] }),
        customFood({ name: 'Egg, whole', unit: 'g', servingAmount: 50, calories: 72, protein: 6, carbs: 0.4, fat: 5, ingredients: [] }),
        customFood({ name: 'Chickpeas, canned', unit: 'g', servingAmount: 100, calories: 139, protein: 7, carbs: 22, fat: 2.6, ingredients: [] }),
    ];

    it('needs every word, and prefers the plainest name', () => {
        expect(pantryMatch(pantry, 'egg').name).toBe('Egg, whole');
        expect(pantryMatch(pantry, 'chickpea').name).toBe('Chickpeas, canned');
        expect(pantryMatch(pantry, 'chickpea flour')).toBeNull();
        expect(pantryMatch(pantry, '')).toBeNull();
    });
});

describe('suggestAmount', () => {
    const rice = usdaFood('Rice, white, cooked', [namedPortion('1 cup', 158, 'g')]);
    const egg = usdaFood('Egg, whole', [namedPortion('1 large', 50, 'g'), namedPortion('1 extra large', 56, 'g')]);
    const cumin = usdaFood('Spices, cumin seed', [namedPortion('1 tsp, whole', 2.1, 'g'), namedPortion('1 tbsp, whole', 6, 'g')]);

    it('uses grams when the recipe gives a weight', () => {
        const line = readLine(parsed(1, 'can', 'chickpea', 'or 15 ounce'), '');
        expect(suggestAmount(usdaFood('Chickpeas', []), line)).toEqual({ quantity: 425.3, portion: { label: 'g', amount: 1 } });
    });

    it('uses a matching portion for cups and spoons', () => {
        expect(suggestAmount(rice, readLine(parsed(2, 'cup', 'jasmine rice'), ''))).toMatchObject({ quantity: 2, portion: { label: '1 cup (158 g)' } });
        expect(suggestAmount(cumin, readLine(parsed(2, 'teaspoon', 'cumin'), ''))).toMatchObject({ quantity: 2, portion: { label: '1 tsp, whole (2.1 g)' } });
    });

    it('counts things with no unit by their first portion', () => {
        expect(suggestAmount(egg, readLine(parsed(3, null, 'egg'), '3 eggs'))).toMatchObject({ quantity: 3, portion: { label: '1 large (50 g)' } });
    });

    it("gives up rather than guess", () => {
        // A cup of something USDA has no cup size for
        expect(suggestAmount(usdaFood('Spinach', []), readLine(parsed(2, 'cup', 'spinach'), ''))).toBeNull();
        // No amount in the recipe at all
        expect(suggestAmount(rice, readLine(parsed(0, null, 'olive oil'), 'olive oil'))).toBeNull();
    });
});

describe('mealieMeasure', () => {
    it('writes the weight it counted and tidies the note', () => {
        const line = readLine(parsed(1, 'can', 'chickpea', 'or 15 ounce'), '');
        expect(mealieMeasure({ line, food: usdaFood('Chickpeas, canned', []), amount: { quantity: 425.3, portion: { label: 'g', amount: 1 } } }))
            .toEqual({ quantity: 425, unitName: 'gram', foodName: 'chickpea', note: '' });
    });

    it('keeps cups as cups', () => {
        const line = readLine(parsed(2, 'cup', 'jasmine rice'), '');
        expect(mealieMeasure({ line, food: usdaFood('Rice', []), amount: { quantity: 2, portion: namedPortion('1 cup', 158, 'g') } }))
            .toEqual({ quantity: 2, unitName: 'cup', foodName: 'jasmine rice', note: '' });
    });

    it('puts a size in the note and names the food when the parser had none', () => {
        const line = readLine(parsed(3, null, ''), '3 eggs');
        expect(mealieMeasure({ line, food: usdaFood('Egg, whole, raw', []), amount: { quantity: 3, portion: namedPortion('1 large', 50, 'g') } }))
            .toEqual({ quantity: 3, unitName: '', foodName: 'egg', note: 'large' });
    });
});

describe('Mealie food names', () => {
    it('moves a bracketed aside into the note', () => {
        const line = readLine(parsed(1, 'cup', 'parsleys (fresh)'), 'parsleys (fresh)');
        expect(mealieMeasure({ line, food: usdaFood('Parsley, fresh', []), amount: { quantity: 1, portion: namedPortion('1 cup chopped', 60, 'g') } }))
            .toMatchObject({ foodName: 'parsleys', note: 'fresh' });
    });

    it('finds the singular of simple plurals', () => {
        expect(singular('parsleys')).toBe('parsley');
        expect(singular('tomatoes')).toBe('tomato');
        expect(singular('hummus')).toBeNull();
        expect(singular('rice')).toBeNull();
    });
});

describe('rankUsda', () => {
    // Real USDA Generic results, in USDA's own order
    const results = (...names) => names.map(name => usdaFood(name, []));
    const top = (foods, name, unit) => rankUsda(foods, name, unit)[0].name;

    it('puts the ingredient itself ahead of foods made from it', () => {
        expect(top(results('Chickpea flour (besan)', 'Chickpeas, (garbanzo beans, bengal gram), dry',
            'Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids'), 'chickpea', 'can'))
            .toBe('Chickpeas (garbanzo beans, bengal gram), mature seeds, canned, drained solids');
        expect(top(results('Bread, cinnamon', 'Bagels, cinnamon-raisin', 'Spices, cinnamon, ground'), 'cinnamon')).toBe('Spices, cinnamon, ground');
        expect(top(results('Butter, Clarified butter (ghee)', 'Butter, salted', 'Almond butter, creamy'), 'butter')).toBe('Butter, salted');
    });

    it('skips restaurant entries and ones with no calorie data', () => {
        const onionRings = usdaFood("DENNY'S, onion rings", []);
        const noCalories = { ...usdaFood('Oil, olive, extra light', []), nutrients: { calories: 0, protein: 0, carbs: 0, fat: 100 } };
        expect(rankUsda([onionRings, usdaFood('Onions, raw', [])], 'onion')[0].name).toBe('Onions, raw');
        expect(rankUsda([noCalories, usdaFood('Oil, olive, salad or cooking', [])], 'olive oil')[0].name).toBe('Oil, olive, salad or cooking');
    });

    it('searches without the prep words', () => {
        expect(usdaQuery('fresh garlic, minced')).toBe('garlic');
        expect(usdaQuery('ground beef')).toBe('ground beef');
    });
});
