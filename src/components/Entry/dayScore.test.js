import { describe, expect, it } from 'vitest';
import { calorieScore, dayGrade, dayScore } from './dayScore';

// BMR 2200, maintenance 3000, goal 2000: the good range is 2000-2200
const targets = { BMR: 2200, TDEEValue: 3000, dailyMacros: { goalCalories: 2000, goalProtein: 200, goalCarbs: 200, goalFat: 44 } };
const range = { low: 2000, high: 2200, tdee: 3000 };
const food = (macros, extra = {}) => ({ id: Math.random().toString(), name: 'Food', amount: '1', macros, ...extra });
const dayOf = (...entries) => {
    const macros = entries.reduce((sum, el) => ({
        calories: sum.calories + el.macros.calories, protein: sum.protein + el.macros.protein,
        carbs: sum.carbs + el.macros.carbs, fat: sum.fat + el.macros.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return { date: '2026-10-27', food: entries, water: [], macros };
}

describe('calorieScore', () => {
    it('doesn\'t mark down anything between the goal and BMR', () => {
        expect([2000, 2100, 2200].map(cal => calorieScore(cal, range))).toEqual([100, 100, 100]);
    });

    it('halves by maintenance and runs out 500 kcal past it', () => {
        expect(calorieScore(2600, range)).toBe(75);
        expect(calorieScore(3000, range)).toBe(50);
        expect(calorieScore(3250, range)).toBe(25);
        expect(calorieScore(3500, range)).toBe(0);
    });

    it('marks down eating well under the range, but not partway through today', () => {
        expect(calorieScore(1500, range)).toBe(70);
        expect(calorieScore(1000, range)).toBe(0);
        expect(calorieScore(1000, range, true)).toBe(100);
    });

    it('works when the goal is above BMR', () => {
        const goalAbove = { ...targets, BMR: 1800 };
        expect(dayScore(dayOf(food({ calories: 1900, protein: 190, carbs: 190, fat: 42 })), goalAbove).range).toMatchObject({ low: 1800, high: 2000 });
    });
});

describe('dayScore', () => {
    it('gives a balanced day in range full marks', () => {
        const result = dayScore(dayOf(food({ calories: 2100, protein: 205, carbs: 205, fat: 45 })), targets);
        expect(result).toMatchObject({ score: 100, grade: 'A+', zone: 'in', focus: null });
        expect(result.split).toEqual({ protein: 40, carbs: 40, fat: 20 });
    });

    it('counts calories with no macros against the logging part', () => {
        const result = dayScore(dayOf(food({ calories: 2100, protein: 0, carbs: 0, fat: 0 }, { estimate: true })), targets);
        expect(result.parts.logging).toBe(0);
        expect(result.focus.key).toBe('logging');
        expect(result.grade).toBe('D');
    });

    it('judges today on the mix so far, not the whole day\'s grams', () => {
        const lunch = dayOf(food({ calories: 700, protein: 70, carbs: 70, fat: 15.5 }));
        expect(dayScore(lunch, targets, { inProgress: true }).grade).toBe('A+');
        expect(dayScore(lunch, targets).grade).not.toBe('A+');
    });

    it('grades a takeout day at maintenance a D, even with decent protein', () => {
        // Oct 28: 2,640 kcal with a pizza estimate, fat at three times its goal
        const takeout = { BMR: 2195, TDEEValue: 2634, dailyMacros: { goalCalories: 1634, goalProtein: 163, goalCarbs: 163, goalFat: 36 } };
        const day = dayOf(
            food({ calories: 640, protein: 42, carbs: 46, fat: 32 }),
            food({ calories: 2000, protein: 85, carbs: 225, fat: 84 }, { estimate: true, estimateType: 'pizza' }),
        );
        const result = dayScore(day, takeout);
        expect(result.zone).toBe('overTdee');
        expect(result.grade).toBe('D');
        expect(result.score).toBeLessThanOrEqual(64);
    });

    it('gives chicken and veg in range an A, even a little light on carbs', () => {
        const day = dayOf(food({ calories: 1700, protein: 170, carbs: 125, fat: 38 }));
        expect(dayScore(day, { ...targets, BMR: 1900, dailyMacros: { goalCalories: 1700, goalProtein: 170, goalCarbs: 170, goalFat: 38 } }).grade).toMatch(/^A/);
    });

    it('caps a day over the range but under maintenance at B', () => {
        const day = dayOf(food({ calories: 2500, protein: 250, carbs: 250, fat: 55 }));
        expect(dayScore(day, targets).score).toBeLessThanOrEqual(87);
    });

    it('has no score without targets, food, or on an untracked day', () => {
        const day = dayOf(food({ calories: 2100, protein: 205, carbs: 205, fat: 45 }));
        expect(dayScore(day, null)).toBe(null);
        expect(dayScore({ ...day, untracked: true }, targets)).toBe(null);
        expect(dayScore(dayOf(), targets)).toBe(null);
    });

    it('grades on a 100 point scale, never below D', () => {
        expect([96, 90, 80, 70, 10].map(dayGrade)).toEqual(['A+', 'A', 'B', 'C', 'D']);
    });
});
