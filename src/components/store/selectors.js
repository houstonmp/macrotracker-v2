import { createSelector } from '@reduxjs/toolkit';
import { BMRMifflin, TDEE, MacrosByDiceSplit, getAgeFromBirthday } from '../../assets/functions';

const selectUser = state => state.ui.userPreferences.user;
const selectWeights = state => state.weight.weightObj;

export const selectLatestWeight = createSelector([selectWeights], weights =>
    weights.length > 0 ? weights.reduce((latest, el) => (el.date > latest.date ? el : latest)) : null
);

// Targets are derived from the profile and the latest weigh-in rather than stored,
// so they can never fall out of date with either one.
export const selectDailyTargets = createSelector([selectUser, selectLatestWeight], (user, latestWeight) => {
    if (!latestWeight || !user.height || !user.birthday || !user.activityLevel || !user.weightDeficit) {
        return null;
    }
    const age = getAgeFromBirthday(user.birthday);
    const BMR = BMRMifflin(Number(latestWeight.kgs), user.height.cm, age, user.sex);
    const TDEEValue = TDEE(user.activityLevel, BMR);

    return {
        age,
        BMR,
        TDEEValue,
        dailyMacros: MacrosByDiceSplit(TDEEValue, (user.weightDeficit.lbs * 3500 / 7))
    };
});
