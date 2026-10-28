import { dayNumber, paceLines, periodBounds, weightView } from './weightRange';

const round1 = (value) => Math.round(value * 10) / 10;

// Graded on how much of goal pace you lost between the period's first and last weigh-ins.
// The lowest grade is a D: a slow week is information, not a failure.
const GRADES = [
    { grade: 'A+', from: 1.25 },
    { grade: 'A', from: 1 },
    { grade: 'B', from: 0.75 },
    { grade: 'C', from: 0.5 },
    { grade: 'D', from: -Infinity },
];

export const gradeFor = (ratio) => GRADES.find(el => ratio >= el.from).grade;

// Everything the score card shows for one week or month. `score` needs a weekly goal
// and at least two weigh-ins on different days; the other numbers only need weigh-ins.
export const periodScore = (weights, rangeId, today, offset, lbsPerWeek) => {
    const view = weightView(weights, rangeId, today, offset);
    const pace = paceLines(view, lbsPerWeek);
    const result = { view, pace, weighIns: view.inRange.length };
    if (view.inRange.length === 0) {
        return result;
    }
    const lbs = view.inRange.map(el => Number(el.lbs));
    const first = view.inRange[0];
    const last = view.inRange[view.inRange.length - 1];
    const days = dayNumber(last.date) - dayNumber(first.date);
    Object.assign(result, {
        first: lbs[0],
        last: lbs[lbs.length - 1],
        low: Math.min(...lbs),
        change: round1(lbs[lbs.length - 1] - lbs[0]),
        weighInDays: new Set(view.inRange.map(el => el.date)).size,
        days,
    });
    if (days > 0) {
        result.perWeek = round1(result.change / days * 7);
        // 3,500 kcal to a pound, the same rule the daily calorie goal uses
        result.kcalPerDay = Math.round(-result.change * 3500 / days);
    }
    if (pace && days > 0) {
        const ratio = (result.first - result.last) / (lbsPerWeek * days / 7);
        result.score = {
            ratio,
            grade: gradeFor(ratio),
            met: result.last <= pace.target,
            onPace: ratio >= 1,
            toTarget: round1(result.last - pace.target),
        };
    }
    return result;
}

const success = (period) => Boolean(period.score && (period.score.met || period.score.onPace));

// Periods in a row that hit the target or goal pace. The current period counts once it
// has; until then it doesn't break the run.
export const targetStreak = (weights, rangeId, today, lbsPerWeek) => {
    let count = success(periodScore(weights, rangeId, today, 0, lbsPerWeek)) ? 1 : 0;
    for (let offset = -1; offset > -120; offset--) {
        if (!success(periodScore(weights, rangeId, today, offset, lbsPerWeek))) {
            break;
        }
        count++;
    }
    return count;
}

// Average calories logged on the days of the period that have any food logged
export const loggedCalories = (diary, rangeId, today, offset) => {
    const { start, end } = periodBounds(rangeId, today, offset);
    const days = diary.filter(el => dayNumber(el.date) >= start && dayNumber(el.date) < end
        && el.macros && el.macros.calories > 0);
    if (days.length === 0) {
        return null;
    }
    return { average: Math.round(days.reduce((sum, el) => sum + el.macros.calories, 0) / days.length), days: days.length };
}
