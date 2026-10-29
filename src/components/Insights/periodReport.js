import { localDate } from '../../assets/functions';
import { dayGrade, dayScore } from '../Entry/dayScore';
import { exerciseGrade, periodExercise } from '../Exercise/exercise';
import { dateFromDay, dayNumber, periodBounds, periodTitle } from '../Weight/weightRange';
import { periodScore } from '../Weight/weightScore';

// The food diary over a period: the average day score over the days with food logged,
// leaving out untracked days. Today is scored as a day still in progress.
export const foodPeriod = (diaryObj, targets, dates, today) => {
    if (!targets) {
        return null;
    }
    const scored = dates
        .filter(date => date <= today)
        .map(date => dayScore(diaryObj.find(el => el.date === date), targets, { inProgress: date === today }))
        .filter(Boolean);
    if (scored.length === 0) {
        return null;
    }
    const score = Math.round(scored.reduce((sum, el) => sum + el.score, 0) / scored.length);
    const calories = Math.round(scored.reduce((sum, el) => sum + el.calories, 0) / scored.length);
    return { grade: dayGrade(score), score, days: scored.length, calories };
}

// Workouts over a period, as days a week. A period still going counts the days so far,
// but never less than a week, so one early workout can't read as an A+.
export const workoutPeriod = (diaryObj, dates, today) => {
    const exercise = periodExercise(diaryObj, dates);
    const daysSoFar = dates.filter(date => date <= today).length;
    const perWeek = Math.round(exercise.activeDays / (Math.max(daysSoFar, 7) / 7) * 10) / 10;
    return { ...exercise, perWeek, grade: exerciseGrade(perWeek) };
}

// Letters to points and back, for the overall average
const POINTS = { 'A+': 4.3, A: 4, B: 3, C: 2, D: 1 };
const FROM_POINTS = [{ grade: 'A+', from: 4.15 }, { grade: 'A', from: 3.5 }, { grade: 'B', from: 2.5 }, { grade: 'C', from: 1.5 }, { grade: 'D', from: -Infinity }];

export const overallGrade = (grades) => {
    const known = grades.filter(Boolean);
    if (known.length === 0) {
        return null;
    }
    const average = known.reduce((sum, grade) => sum + POINTS[grade], 0) / known.length;
    return FROM_POINTS.find(el => average >= el.from).grade;
}

// The report card for the week, month or year the weight chart is showing
export const periodReport = ({ diaryObj, weights, targets, lbsPerWeek }, rangeId, offset = 0, todayDate = localDate()) => {
    const today = dayNumber(todayDate);
    const { start, end } = periodBounds(rangeId, today, offset);
    const dates = Array.from({ length: end - start }, (_, i) => dateFromDay(start + i));

    const food = foodPeriod(diaryObj, targets, dates, todayDate);
    const weightPeriod = periodScore(weights, rangeId, today, offset, lbsPerWeek);
    const weight = weightPeriod.weighIns > 0 ? {
        grade: weightPeriod.score ? weightPeriod.score.grade : null,
        change: weightPeriod.weighIns > 1 ? weightPeriod.change : null,
        onPace: weightPeriod.score ? weightPeriod.score.onPace : null,
    } : null;
    const workouts = workoutPeriod(diaryObj, dates, todayDate);

    return {
        title: periodTitle(rangeId, start, end),
        current: today < end,
        food,
        weight,
        workouts,
        overall: overallGrade([food && food.grade, weight && weight.grade, workouts.grade]),
    };
}
