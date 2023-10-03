
//BMR Formula uses the Harris-Benedict Formula

export const BMRImperialMen = (weightLbs, heightIn, ageYears) => {
    return parseInt((6.23762 * weightLbs) + (12.7084 * heightIn) - (6.755 * ageYears) + 66.473);
}

export const BMRMetricMen = (weightKgs, heightCm, ageYears) => {
    return parseInt((13.7516 * weightKgs) + (5.0033 * heightCm) - (6.755 * ageYears) + 66.473);
}

export const BMRMetricWomen = (weightKgs, heightCm, ageYears) => {
    return parseInt((9.5634 * weightKgs) + (1.8496 * heightCm) - (4.6756 * ageYears) + 655.0955);
}

export const BMRImperialWomen = (weightLbs, heightIn, ageYears) => {
    return parseInt((4.33789 * weightLbs) + (4.69798 * heightIn) - (4.6756 * ageYears) + 655.0955);
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

//Body Fat % formula based on Navy formula
export const BodyFatMenMetric = (waist, neck, height) => {
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76
}

export const BodyFatWomenMetric = (waist, hip, neck, height) => {
    return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) + 78.387;
}

export const getAgeFromBirthday = (birthYear, birthMonth, birthDay) => {
    let currentDate = new Date();
    return parseInt((((currentDate.getFullYear() - birthYear) * 365) + ((currentDate.getMonth() - birthMonth) * 12) + (currentDate.getDate() - birthDay)) / 365);
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
