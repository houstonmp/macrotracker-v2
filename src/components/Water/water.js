// A common rule of thumb is 33 ml of water per kg of body weight a day, but that counts
// the water in food too, which covers about a fifth of it. The goal here is drinks only:
// 80% of that, about 26 ml per kg. Hot days and workouts need more.
export const ML_PER_KG = 26;
export const ML_PER_OZ = 29.5735;
// Quick adds for when you're estimating. Old entries saved as 'cup' are coffee cups.
export const SERVINGS = [
    { kind: 'cup', label: 'Coffee cup', plural: 'Coffee cups', size: '8 fl oz', ml: 240 },
    { kind: 'glass', label: 'Water glass', plural: 'Water glasses', size: '12 fl oz', ml: 355 },
];

// Rounded to 50 ml so the goal reads as a tidy number
export const waterGoal = (kgs) => (Number(kgs) > 0 ? Math.round(Number(kgs) * ML_PER_KG / 50) * 50 : null);

export const waterTotal = (day) => (day && day.water ? day.water.reduce((sum, el) => sum + el.ml, 0) : 0);

export const toMl = (amount, unit) => Math.round(unit === 'oz' ? amount * ML_PER_OZ : amount);

// "2.25 L"; one decimal place drops a trailing zero
export const litres = (ml) => `${Math.round(ml / 10) / 100} L`;

