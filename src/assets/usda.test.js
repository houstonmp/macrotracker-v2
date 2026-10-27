import { describe, expect, it } from 'vitest';
import { foodMacros } from './food';
import { normalizeUsdaFood, normalizeUsdaPortions } from './usda';

const nutrients = (values) => Object.entries(values).map(([nutrientNumber, value]) => ({ nutrientNumber, value }));

describe('normalizeUsdaFood', () => {
    it('falls back to Atwater energy for Foundation foods', () => {
        const food = normalizeUsdaFood({
            fdcId: 1, description: 'Chicken, breast, boneless, skinless, raw', dataType: 'Foundation',
            foodNutrients: nutrients({ 204: 1.93, 203: 22.5, 205: 0, 957: 106, 958: 112 }),
        });
        expect(food.unit).toBe('g');
        expect(food.nutrients).toEqual({ calories: 112, protein: 22.5, carbs: 0, fat: 1.93 });
        expect(food.missing).toEqual([]);
        expect(food.portions).toEqual([]);
    });

    it('converts kJ when no kcal value exists', () => {
        const food = normalizeUsdaFood({ fdcId: 2, description: 'x', foodNutrients: nutrients({ 268: 1100, 203: 1, 204: 1, 205: 1 }) });
        expect(food.nutrients.calories).toBe(262.91);
    });

    it('clamps negative lab values and flags missing nutrients', () => {
        const food = normalizeUsdaFood({ fdcId: 3, description: 'x', foodNutrients: nutrients({ 205: -0.428, 203: 21.4 }) });
        expect(food.nutrients.carbs).toBe(0);
        expect(food.missing).toEqual(['calories', 'fat']);
    });

    it('treats branded nutrients as per 100 g and keeps the label serving as a portion', () => {
        const food = normalizeUsdaFood({
            fdcId: 4, description: 'CHICKEN BREAST', dataType: 'Branded', brandName: 'ACME',
            servingSize: 284, servingSizeUnit: 'GRM', householdServingFullText: '1 CHICKEN BREAST',
            foodNutrients: nutrients({ 203: 20.4, 204: 8.1, 205: 1.06, 208: 165 }),
        });
        expect(food.brand).toBe('ACME');
        expect(food.unit).toBe('g');
        expect(food.portions).toEqual([{ label: '1 CHICKEN BREAST (284 g)', amount: 284 }]);
        // One 284 g breast, not the 165 kcal the old serving-size maths produced
        expect(foodMacros(food, 284).calories).toBe(468.6);
    });

    it('measures branded drinks in ml', () => {
        const food = normalizeUsdaFood({
            fdcId: 5, description: 'COLD BREW', dataType: 'Branded', servingSize: 325, servingSizeUnit: 'MLT', householdServingFullText: '1 BOTTLE',
            foodNutrients: nutrients({ 203: 0.6, 204: 0, 205: 0.6, 208: 2 }),
        });
        expect(food.unit).toBe('ml');
        expect(food.portions).toEqual([{ label: '1 BOTTLE (325 ml)', amount: 325 }]);
        expect(foodMacros(food, 325).calories).toBe(6.5);
    });
});

describe('normalizeUsdaPortions', () => {
    it('builds readable labels from each portion format', () => {
        expect(normalizeUsdaPortions([
            { amount: 1, modifier: 'whole without shell', gramWeight: 50.3, measureUnit: { name: 'egg' } },
            { amount: 1, gramWeight: 50, measureUnit: { name: 'RACC' } },
            { amount: 1, modifier: 'small bagel (3" dia)', gramWeight: 69, measureUnit: { name: 'undetermined' } },
            { portionDescription: '1 cup', gramWeight: 240, measureUnit: { name: 'undetermined' } },
            { portionDescription: 'Quantity not specified', gramWeight: 0 },
        ])).toEqual([
            { label: '1 egg whole without shell (50.3 g)', amount: 50.3 },
            { label: '1 serving (50 g)', amount: 50 },
            { label: '1 small bagel (3" dia) (69 g)', amount: 69 },
            { label: '1 cup (240 g)', amount: 240 },
        ]);
    });
});
