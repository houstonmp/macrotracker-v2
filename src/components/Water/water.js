// A common rule of thumb: about 33 ml of water per kg of body weight a day, which is
// the same as half your weight in pounds as fluid ounces. Hot days and workouts need more.
export const ML_PER_KG = 33;
export const ML_PER_OZ = 29.5735;
// An average cup or mug of coffee, tea or water: 8 fl oz
export const CUP_ML = 240;

// Rounded to 50 ml so the goal reads as a tidy number
export const waterGoal = (kgs) => (Number(kgs) > 0 ? Math.round(Number(kgs) * ML_PER_KG / 50) * 50 : null);

export const waterTotal = (day) => (day && day.water ? day.water.reduce((sum, el) => sum + el.ml, 0) : 0);

export const toMl = (amount, unit) => Math.round(unit === 'oz' ? amount * ML_PER_OZ : amount);

// "2.25 L"; one decimal place drops a trailing zero
export const litres = (ml) => `${Math.round(ml / 10) / 100} L`;

export const waterLabel = (entry) => (entry.kind === 'cup' ? '1 cup' : entry.label || `${entry.ml} ml`);
