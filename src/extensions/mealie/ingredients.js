// Turning Mealie's ingredient lines into FitPad amounts, and back.
//
// Mealie's parser splits "1 (15 oz) can chickpeas, drained" into 1 / can / chickpea with
// "or 15 ounce" left in the note. The weight in the note is what actually turns into
// macros, so it wins over "1 can". Nothing here guesses silently: a line is only marked
// as looking right when the food and the amount both came straight from the recipe.

import { unitPortion } from '../../assets/food';

// ---- Reading amounts ----

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉';
const VULGAR = { '¼': '1/4', '½': '1/2', '¾': '3/4', '⅓': '1/3', '⅔': '2/3', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };

// "14 ¹/₂" and "14½" → "14 1/2"
export const normalizeFractions = (text) => (text || '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => String(SUPERSCRIPT.indexOf(ch)))
    .replace(/[₀-₉]/g, ch => String(SUBSCRIPT.indexOf(ch)))
    .replace(/⁄/g, '/')
    .replace(/(\d?)([¼½¾⅓⅔⅛⅜⅝⅞])/g, (match, digit, fraction) => `${digit ? `${digit} ` : ''}${VULGAR[fraction]}`);

// "14 1/2" → 14.5, "1/2" → 0.5, "1.5" → 1.5
export const parseNumber = (text) => {
    const match = normalizeFractions(text).trim().match(/^(\d+(?:\.\d+)?)?\s*(?:(\d+)\/(\d+))?$/);
    if (!match || (!match[1] && !match[2])) {
        return null;
    }
    const whole = match[1] ? Number(match[1]) : 0;
    const fraction = match[2] ? Number(match[2]) / Number(match[3]) : 0;
    return whole + fraction;
}

// Grams or millilitres in one of each unit. Volumes only convert to volumes: a cup of
// flour and a cup of oil weigh very different amounts.
const WEIGHTS = { gram: 1, kilogram: 1000, ounce: 28.35, pound: 453.6 };
const VOLUMES = { milliliter: 1, liter: 1000, 'fluid ounce': 29.57, cup: 236.6, tablespoon: 14.79, teaspoon: 4.93 };

const UNIT_ALIASES = {
    g: 'gram', gram: 'gram', grams: 'gram', gr: 'gram',
    kg: 'kilogram', kilogram: 'kilogram', kilograms: 'kilogram',
    oz: 'ounce', ounce: 'ounce', ounces: 'ounce',
    lb: 'pound', lbs: 'pound', pound: 'pound', pounds: 'pound',
    ml: 'milliliter', milliliter: 'milliliter', milliliters: 'milliliter', millilitre: 'milliliter', millilitres: 'milliliter',
    l: 'liter', liter: 'liter', liters: 'liter', litre: 'liter', litres: 'liter',
    'fl oz': 'fluid ounce', 'fluid ounce': 'fluid ounce', 'fluid ounces': 'fluid ounce',
    cup: 'cup', cups: 'cup', c: 'cup',
    tbsp: 'tablespoon', tbs: 'tablespoon', tablespoon: 'tablespoon', tablespoons: 'tablespoon',
    tsp: 'teaspoon', teaspoon: 'teaspoon', teaspoons: 'teaspoon',
    can: 'can', cans: 'can', clove: 'clove', cloves: 'clove', slice: 'slice', slices: 'slice',
    pinch: 'pinch', pinches: 'pinch', stick: 'stick', sticks: 'stick', package: 'package', packages: 'package',
    bunch: 'bunch', head: 'head', piece: 'piece', pieces: 'piece', serving: 'serving', servings: 'serving',
};

export const canonicalUnit = (name) => UNIT_ALIASES[(name || '').toLowerCase().replace(/\.$/, '').trim()] || null;

const NUMBER = '(\\d+(?:\\.\\d+)?(?:\\s+\\d+\\/\\d+)?|\\d+\\/\\d+)';
const MEASURE_UNITS = 'fl\\.? oz|fluid ounces?|ounces?|oz|pounds?|lbs?|kilograms?|kg|grams?|g|millilit(?:er|re)s?|ml|lit(?:er|re)s?|l';
const MEASURE = new RegExp(`${NUMBER}\\s*-?\\s*(${MEASURE_UNITS})\\b\\.?`, 'i');

// A weight or volume written anywhere in the text: "or 15 ounce", "(14 ¹/₂ oz)", "400g"
// → { amount: 425.25, unit: 'g', text: '15 ounce' }
export const findMeasure = (text) => {
    const match = normalizeFractions(text).match(MEASURE);
    if (!match) {
        return null;
    }
    const value = parseNumber(match[1]);
    const unit = canonicalUnit(match[2].replace(/\./g, ''));
    if (value === null || !unit) {
        return null;
    }
    if (WEIGHTS[unit]) {
        return { amount: Math.round(value * WEIGHTS[unit] * 10) / 10, unit: 'g', text: match[0].trim() };
    }
    return { amount: Math.round(value * VOLUMES[unit] * 10) / 10, unit: 'ml', text: match[0].trim() };
}

// Things a recipe says to add "to taste" barely count, and salt and water have no macros
const TO_TASTE = /\b(to taste|as needed|for (garnish|serving)|optional)\b/i;
const NO_MACROS = /^(salt|kosher salt|sea salt|pepper|black pepper|salt (and|&) pepper|water|ice|cold water|warm water|hot water)$/i;

// Bits of the recipe website that the scraper picked up as ingredients:
// "(A - Ingredients)", "Cook Mode Prevent your screen from going dark"
const NOT_AN_INGREDIENT = /^\(.*\)$|cook mode|prevent your screen|here are some/i;

// One Mealie line, made easy to work with. `parsed` is what Mealie's parser returned
// (or the stored line, if it was already parsed); `text` is what the recipe says.
export const readLine = (parsed, text) => {
    const unitName = parsed.unit ? parsed.unit.name : '';
    const foodName = parsed.food ? parsed.food.name : '';
    const note = normalizeFractions(parsed.note);
    const quantity = Number(parsed.quantity) > 0 ? Number(parsed.quantity) : null;
    const unit = canonicalUnit(unitName);

    // A weight or volume beats a count: "1 can … or 15 ounce" is 15 ounces
    let measure = findMeasure(note) || findMeasure(text);
    if (!measure && quantity && unit && (WEIGHTS[unit] || VOLUMES[unit])) {
        measure = WEIGHTS[unit]
            ? { amount: Math.round(quantity * WEIGHTS[unit] * 10) / 10, unit: 'g', text: '' }
            : { amount: Math.round(quantity * VOLUMES[unit] * 10) / 10, unit: 'ml', text: '' };
    }

    return {
        text,
        quantity,
        unitName,
        unit,
        foodName,
        note,
        measure,
        confidence: parsed.confidence ?? 1,
        // Salt, pepper, water and anything "to taste" start out not counted
        skip: NO_MACROS.test(foodName.trim()) || (TO_TASTE.test(text) && !quantity) || NOT_AN_INGREDIENT.test((text || '').trim()),
    };
}

// ---- Matching to FitPad foods ----

const words = (name) => (name || '').toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
    // "chickpeas" and "chickpea", "tomatoes" and "tomato"
    .map(word => word.replace(/(oes|es|s)$/, (end) => (end === 'oes' ? 'o' : '')));

// The pantry food whose name contains every word of Mealie's food name; the shortest such
// name wins, so "egg" picks "Egg, whole" over "Egg noodles, cooked, enriched"
export const pantryMatch = (items, foodName) => {
    const wanted = words(foodName);
    if (wanted.length === 0) {
        return null;
    }
    const matches = items.filter(food => {
        const have = words(food.name);
        return wanted.every(word => have.includes(word));
    });
    return matches.sort((a, b) => a.name.length - b.name.length)[0] || null;
}

const portionUnit = (portion) => {
    const label = normalizeFractions(portion.label).toLowerCase();
    const match = label.match(/^(?:\d+(?:\.\d+)?|\d+\/\d+)?\s*([a-z.]+(?:\s+oz)?)/);
    return match ? canonicalUnit(match[1]) || match[1] : null;
}

const portionCount = (portion) => parseNumber((normalizeFractions(portion.label).match(/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)/) || [])[1] || '1') || 1;

// The FitPad amount for a line, or null when it can't be worked out from the recipe:
//   a weight or volume the food is measured in → that many g or ml
//   a unit the food has a portion for ("2 cups", "3 large") → that many portions
//   no unit at all ("2 eggs") → the food's first portion, if it has one
export const suggestAmount = (food, line) => {
    const base = unitPortion(food);
    if (line.measure && base && line.measure.unit === food.unit) {
        return { quantity: line.measure.amount, portion: base };
    }
    if (!line.quantity) {
        return null;
    }
    const portions = food.portions;
    const unit = line.unit || canonicalUnit(line.unitName) || (line.unitName || '').toLowerCase();
    if (unit) {
        const portion = portions.find(el => portionUnit(el) === unit);
        return portion ? { quantity: Math.round((line.quantity / portionCount(portion)) * 100) / 100, portion } : null;
    }
    return portions.length > 0 ? { quantity: line.quantity, portion: portions[0] } : null;
}

// ---- Writing back to Mealie ----

// The singular, so "parsleys" finds Mealie's existing "parsley"; null if it isn't plural
export const singular = (name) => {
    if (/(ss|us|is)$/i.test(name)) {
        return null;
    }
    if (/oes$/i.test(name)) {
        return name.slice(0, -2);
    }
    return /s$/i.test(name) ? name.slice(0, -1) : null;
}

// "Chickpeas, canned, drained" → "chickpeas"
export const shortFoodName = (name) => (name || '').split(',')[0].trim().toLowerCase();

// What the line should say in Mealie: the amount FitPad counted, in the recipe's terms.
// { quantity, unitName, foodName, note }; unitName is '' for counts like "2 egg".
export const mealieMeasure = ({ line, food, amount }) => {
    const quantity = Number(amount.quantity);
    const portion = amount.portion;
    const notes = [];
    // Drop the weight the parser left in the note once it's the amount itself
    const note = line.measure && line.measure.text
        ? line.note.replace(line.measure.text, '').replace(/\(\s*\)/g, '').replace(/^\s*(or|,)\s*|\s*(or|,)\s*$/gi, '').trim()
        : line.note;
    if (note) {
        notes.push(note);
    }

    let result;
    if (portion.label === 'g' || portion.label === 'ml') {
        // Mealie shows 425.3 g as "425 ³/₁₀ grams"; a whole number reads better in a recipe
        result = { quantity: Math.round(quantity), unitName: portion.label === 'g' ? 'gram' : 'milliliter' };
    } else {
        const count = portionCount(portion);
        const unit = portionUnit(portion);
        const known = unit && UNIT_ALIASES[unit] === undefined ? null : unit;
        if (known) {
            result = { quantity: Math.round(quantity * count * 100) / 100, unitName: known };
        } else {
            // "1 large (50 g)": the size goes in the note, the count stays a count
            const size = normalizeFractions(portion.label).replace(/^\d+(?:\.\d+)?(?:\s+\d+\/\d+)?\s*/, '').replace(/\s*\(.*\)\s*$/, '').trim();
            if (size) {
                notes.unshift(size);
            }
            result = { quantity: Math.round(quantity * count * 100) / 100, unitName: '' };
        }
    }
    // "parsleys (fresh)" → food "parsleys", note "fresh"
    const rawName = line.foodName || shortFoodName(food.name);
    const aside = (rawName.match(/\(([^)]*)\)/) || [])[1];
    if (aside) {
        notes.push(aside.trim());
    }
    const foodName = rawName.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    return { ...result, foodName, note: notes.join(', ') };
}

// ---- Picking from USDA results ----
// USDA's own order puts "Chickpea flour" before chickpeas and "Bread, cinnamon" before
// the spice. Its names read "Main item, detail, detail", so a food scores for having the
// ingredient up front and loses for being a different kind of thing altogether.

// How a recipe describes an ingredient rather than what it is
const PREP_WORDS = /\b(fresh|freshly|diced|chopped|minced|sliced|grated|shredded|crushed|large|small|medium|finely|roughly|thinly|toasted|cooked|uncooked|boneless|skinless|organic|plain|whole)\b/gi;

export const usdaQuery = (foodName) => (foodName || '').replace(PREP_WORDS, ' ').replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Different foods that share a word with the ingredient; only a penalty when the
// ingredient doesn't say it
const OTHER_THINGS = ['babyfood', 'toddler', 'infant', 'bread', 'bagel', 'muffin', 'cracker', 'snack', 'cake', 'cookie', 'flour',
    'candy', 'candie', 'dessert', 'croissant', 'mayonnaise', 'margarine', 'supplement', 'fast', 'lunchmeat', 'breaded', 'soup', 'juice',
    'dehydrated', 'freeze', 'dried', 'powder', 'yogurt', 'white', 'yolk', 'clarified', 'ring', 'roll', 'tender', 'formula', 'beverage', 'dressing',
    'bun', 'fried', 'deli', 'prepackaged', 'rotisserie', 'sheep', 'goat', 'human', 'bran', 'crude', 'sauce', 'noodle', 'vinegar', 'corned', 'cured',
    'buttermilk', 'flavor', 'sliced', 'patty', 'patties', 'frozen', 'broiled', 'condensed', 'evaporated'];

const scoreUsda = (food, wanted, canned) => {
    const segments = food.name.split(',').map(words);
    const all = segments.flat();
    if (!wanted.every(word => all.includes(word))) {
        return -100;
    }
    let score = 0;
    wanted.forEach(word => {
        score += segments[0].includes(word) ? 3 : (segments[1] || []).includes(word) ? 2 : 1;
    });
    // "Almond butter" when the recipe wants butter
    score -= 0.5 * segments[0].filter(word => !wanted.includes(word)).length;
    score -= 5 * OTHER_THINGS.filter(word => all.includes(word) && !wanted.includes(word)).length;
    // Restaurant and brand entries are written in capitals: "DENNY'S, onion rings"
    if (/[A-Z]{3,}/.test(food.name.split(',')[0])) {
        score -= 5;
    }
    // Some entries have no calorie data and would count as 0
    if (food.missing.includes('calories') || (food.nutrients.calories === 0 && food.nutrients.protein + food.nutrients.carbs + food.nutrients.fat > 0)) {
        score -= 4;
    }
    if (canned && all.includes('canned')) {
        score += 2;
    }
    // Recipes list ingredients before cooking
    if (all.includes('raw')) {
        score += 0.5;
    }
    return score;
}

// USDA results reordered best first, keeping USDA's order between equals.
// `unit` is the recipe line's unit: "1 can" prefers canned foods.
export const rankUsda = (foods, foodName, unit) => {
    const wanted = words(usdaQuery(foodName));
    if (wanted.length === 0) {
        return foods;
    }
    const canned = unit === 'can';
    return foods
        .map((food, index) => ({ food, index, score: scoreUsda(food, wanted, canned) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map(el => el.food);
}

// Whether a ranked result actually has every word of the ingredient in it
export const matchesAll = (food, foodName) => {
    const have = words(food.name);
    return words(usdaQuery(foodName)).every(word => have.includes(word));
}
