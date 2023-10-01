
//BMR Formula uses the Harris-Benedict Formula

const BMRImperialMen = (weightLbs, heightIn, ageYears) => {
    return (6.23762 * weightLbs) + (12.7084 * heightIn) - (6.755 * ageYears) + 66.473;
}

const BMRMetricMen = (weightKgs, heightCm, ageYears) => {
    return (13.7516 * weightKgs) + (5.0033 * heightCm) - (6.755 * ageYears) + 66.473;
}

const BMRMetricWomen = (weightKgs, heightCm, ageYears) => {
    return (9.5634 * weightKgs) + (1.8496 * heightCm) - (4.6756 * ageYears) + 655.0955;
}

const BMRImperialWomen = (weightLbs, heightIn, ageYears) => {
    return (4.33789 * weightLbs) + (4.69798 * heightIn) - (4.6756 * ageYears) + 655.0955;
}


//BMI Calculator
const BMIMetric = (weightLbs, heightIn) => {
    return (weightLbs / (heightIn * heightIn)) * 703;
}

const BMIImperial = (weightKgs, heightCm) => {
    return (weightKgs / (heightCm * heightCm)) * 10000;
}

//Body Fat % formula based on Navy formula
const BodyFatMenMetric = (waist, neck, height) => {
    return 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76
}

const BodyFatWomenMetric = (waist, hip, neck, height) => {
    return 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) + 78.387;
}

const getAgeFromBirthday = (birthYear, birthMonth, birthDay) => {
    let currentDate = new Date();
    return (((currentDate.getFullYear - birthYear) * 365) + ((currentMonth - birthMonth) * 12) + (currentDate.getDate() - birthDay)) / 365;
}

//Calories regularly exhausted from exercise / week (Total Daily EnergyExpenditure)
const TDEE = (activityLevel, BMR) => {
    return activityLevel * BMR
}

//Macros calculated from the 40/40/20
const MacrosByDiceSplit = (TDEE, goalPercentage) => {
    return {
        goalProtein: (TDEE * goalPercentage * 0.4) / 4,
        goalCarbs: (TDEE * goalPercentage * 0.4) / 4,
        goalFat: (TDEE * goalPercentage * 0.4) / 9,

    }
}
