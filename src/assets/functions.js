export const LBS_PER_KG = 2.20462;

//BMR uses the Mifflin-St Jeor equation. Sex defaults to male when it hasn't been set.
export const BMRMifflin = (weightKgs, heightCm, ageYears, sex) => {
    const base = (10 * weightKgs) + (6.25 * heightCm) - (5 * ageYears);
    return Math.round(sex === 'female' ? base - 161 : base + 5);
}

//BMI Calculator
export const BMIImperial = (weightLbs, heightIn) => {
    return parseInt((weightLbs / (heightIn * heightIn)) * 703);
}

export const BMIBoundaries = (BMI, heightIn) => {
    return parseInt((BMI * (heightIn * heightIn)) / 703);
}

export const BMIMetric = (weightKgs, heightCm) => {
    return parseInt((weightKgs / (heightCm * heightCm)) * 10000);
}

//Body Fat % formula based on the US Navy formula (all measurements in inches)
export const BodyFatMenImperial = (waist, neck, height) => {
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
}

export const BodyFatWomenImperial = (waist, hip, neck, height) => {
    return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
}

//Birthday is a 'YYYY-MM-DD' string, as produced by a date input
export const getAgeFromBirthday = (birthday, today = new Date()) => {
    const [year, month, day] = birthday.split('-').map(Number);
    const currentMonth = today.getMonth() + 1;
    const hadBirthday = currentMonth > month || (currentMonth === month && today.getDate() >= day);
    return today.getFullYear() - year - (hadBirthday ? 0 : 1);
}

//Calories regularly exhausted from exercise / week (Total Daily EnergyExpenditure)
export const TDEE = (activityLevel, BMR) => {
    return parseInt(activityLevel * BMR);
}

//Macros calculated from the 40/40/20
export const MacrosByDiceSplit = (TDEE, goalDeficit) => {

    let goal = (TDEE - goalDeficit);

    return {
        goalProtein: parseInt((goal * 0.4) / 4),
        goalCarbs: parseInt((goal * 0.4) / 4),
        goalFat: parseInt((goal * 0.2) / 9),
        goalCalories: parseInt(goal)
    }
}
