import { splitEstimateCalories, unsplitCalories } from '../../assets/food';

const clamp = (value) => Math.max(0, Math.min(100, value));
// Straight line from (x1, y1) to (x2, y2)
const between = (x, x1, y1, x2, y2) => y1 + (y2 - y1) * (x - x1) / (x2 - x1);

// Anywhere between your BMR and your goal calories is a good day: both are a deficit
// you can live with, so neither end is marked down. Above it the deficit shrinks, so the
// score falls to half by TDEE (maintenance, no deficit at all) and to nothing 500 kcal
// past it. Well under your BMR is marked down too, though not on a day still in
// progress, where it only means you haven't eaten yet.
export const calorieScore = (calories, { low, high, tdee }, inProgress) => {
    if (calories >= low && calories <= high) {
        return 100;
    }
    if (calories > high) {
        if (calories <= tdee) {
            return clamp(between(calories, high, 100, tdee, 50));
        }
        return clamp(between(calories, tdee, 50, tdee + 500, 0));
    }
    if (inProgress) {
        return 100;
    }
    // Under the range: 70 at three quarters of it, nothing at half
    if (calories >= low * 0.75) {
        return clamp(between(calories, low * 0.75, 70, low, 100));
    }
    return clamp(between(calories, low * 0.5, 0, low * 0.75, 70));
}

// Protein counts in full from 90% of the goal, and more is fine
const proteinScore = (grams, goal) => clamp(grams / (goal * 0.9) * 100);

// Carbs and fat score best within 20% of the goal either way, and nothing at double it
const balanceScore = (grams, goal) => clamp(100 - Math.max(0, Math.abs(grams / goal - 1) - 0.2) / 0.8 * 100);

// Fat counts double: at 9 kcal a gram it's how takeout piles on calories
const balance = (carbs, fat) => (carbs + fat * 2) / 3;

// How much of the day's calories have real macros behind them: logged foods count fully,
// estimates split by food type count a little over half, calories alone count nothing
const loggingScore = (day, calories) => {
    if (calories <= 0) {
        return 100;
    }
    const unsplit = unsplitCalories(day);
    const split = splitEstimateCalories(day);
    return clamp((calories - unsplit - split * 0.4) / calories * 100);
}

// Macros carry as much as calories: a balanced plate is the second check that keeps
// calories in line
const WEIGHTS = { calories: 0.35, protein: 0.25, balance: 0.25, logging: 0.15 };

// No deficit can't be made up elsewhere: past maintenance the best is a D, and over your
// range (a smaller deficit) the best is a B
const CAPS = { overTdee: 64, over: 87 };

// Same letters and colours as the weight score, never lower than D
const GRADES = [
    { grade: 'A+', from: 95 },
    { grade: 'A', from: 88 },
    { grade: 'B', from: 78 },
    { grade: 'C', from: 65 },
    { grade: 'D', from: -Infinity },
];
export const dayGrade = (score) => GRADES.find(el => score >= el.from).grade;

// The day's report card, worked out from the diary each time and never saved.
// Null when there's nothing to grade: no targets yet, an untracked day, or no food.
export const dayScore = (day, targets, { inProgress = false } = {}) => {
    if (!targets || !day || day.untracked || day.food.length === 0) {
        return null;
    }
    const { BMR, TDEEValue, dailyMacros } = targets;
    const goal = dailyMacros.goalCalories;
    // The goal can sit above or below BMR depending on the weekly goal; either way the
    // good range is between them
    const range = { low: Math.min(BMR, goal), high: Math.max(BMR, goal), tdee: Math.max(TDEEValue, BMR, goal) };
    const { calories, protein, carbs, fat } = day.macros;

    // A finished day is held to the gram goals. Today is judged on the mix so far
    // (shares of calories against the 40/40/20 split), so lunch isn't marked down for
    // being short of a whole day's protein.
    const known = protein * 4 + carbs * 4 + fat * 9;
    const share = (grams, perGram) => (known > 0 ? grams * perGram / known : 0);
    const parts = {
        calories: calorieScore(calories, range, inProgress),
        protein: inProgress ? proteinScore(share(protein, 4), 0.4) : proteinScore(protein, dailyMacros.goalProtein),
        balance: inProgress
            ? balance(balanceScore(share(carbs, 4), 0.4), balanceScore(share(fat, 9), 0.2))
            : balance(balanceScore(carbs, dailyMacros.goalCarbs), balanceScore(fat, dailyMacros.goalFat)),
        logging: loggingScore(day, calories),
    };
    const weighted = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + parts[key] * weight, 0);

    let zone = 'in';
    if (calories > range.tdee) {
        zone = 'overTdee';
    } else if (calories > range.high) {
        zone = 'over';
    } else if (calories < range.low) {
        zone = 'under';
    }
    const total = CAPS[zone] !== undefined ? Math.min(weighted, CAPS[zone]) : weighted;

    // The part with the most room to grow, for one gentle pointer. Ties go to logging
    // first: with no macros logged, low protein is a symptom of that.
    const named = { calories: 'Calories', protein: 'Protein', balance: 'Carbs and fat', logging: 'Logging detail' };
    const [lowestKey, lowestValue] = ['logging', 'calories', 'protein', 'balance']
        .map(key => [key, parts[key]])
        .reduce((low, el) => (el[1] < low[1] ? el : low));

    return {
        score: Math.round(total),
        grade: dayGrade(total),
        parts,
        range,
        zone,
        calories,
        // Percent of known-macro calories from each, for the split stat
        split: known > 0 ? { protein: Math.round(share(protein, 4) * 100), carbs: Math.round(share(carbs, 4) * 100), fat: Math.round(share(fat, 9) * 100) } : null,
        focus: lowestValue < 85 ? { key: lowestKey, label: named[lowestKey] } : null,
    };
}
