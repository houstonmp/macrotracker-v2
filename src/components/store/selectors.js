import { createSelector } from '@reduxjs/toolkit';
import { BMRMifflin, TDEE, MacrosByDiceSplit, getAgeFromBirthday, localDate } from '../../assets/functions';

const selectUser = state => state.ui.userPreferences.user;
const selectWeights = state => state.weight.weightObj;

// The day the diary, its totals and logging work on: today unless you've paged back
export const selectDiaryDate = state => state.ui.diaryDate || localDate();
export const selectDiaryDay = state => {
    const date = selectDiaryDate(state);
    return state.fDiary.diaryObj.find(el => el.date === date) || null;
}

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
