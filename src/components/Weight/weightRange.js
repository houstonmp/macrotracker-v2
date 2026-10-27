import { BMIBoundaries } from '../../assets/functions';

export const RANGES = [
    { id: 'week', label: 'Week', days: 7, period: 'past week' },
    { id: 'month', label: 'Month', days: 30, period: 'past month' },
    // A year of daily weigh-ins is mostly noise, so it's drawn as weekly averages.
    // The year shows BMI zones; week and month show progress against the weekly goal.
    { id: 'year', label: 'Year', days: 365, period: 'past year', averageDays: 7, bmiZones: true },
];

const DAY_MS = 864e5;

// Dates are 'YYYY-MM-DD'; the chart's x axis counts whole days so gaps between
// weigh-ins are spaced by time, not evenly
export const dayNumber = (date) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;
export const dateFromDay = (day) => new Date(day * DAY_MS).toJSON().slice(0, 10);

// Average the weigh-ins in each block of `days`, placed at the middle of the block
const averageBy = (points, start, days) => {
    const buckets = new Map();
    points.forEach(point => {
        const bucket = Math.floor((point.x - start) / days);
        buckets.set(bucket, [...(buckets.get(bucket) || []), point.y]);
    });
    return [...buckets.entries()].map(([bucket, values]) => ({
        x: start + bucket * days + (days - 1) / 2,
        y: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10,
    }));
}

// The weigh-ins for a range ending today. `points` also includes the last weigh-in
// before the range so the line runs in from the left edge instead of starting mid-chart.
export const weightView = (weights, rangeId, today) => {
    const range = RANGES.find(el => el.id === rangeId);
    const end = today;
    const start = today - range.days;
    const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
    const inRange = sorted.filter(el => dayNumber(el.date) >= start && dayNumber(el.date) <= end);
    const before = sorted.filter(el => dayNumber(el.date) < start).pop();
    const toPoint = el => ({ x: dayNumber(el.date), y: Number(el.lbs) });
    let points = inRange.map(toPoint);
    if (range.averageDays) {
        points = averageBy(points, start, range.averageDays);
    }
    if (before) {
        points = [toPoint(before), ...points];
    }
    const change = inRange.length > 1
        ? Math.round((inRange[inRange.length - 1].lbs - inRange[0].lbs) * 10) / 10
        : null;
    return { range, start, end, inRange, points, change };
}

// Two lines from the first weigh-in in the range to its end: "no change" (flat) and
// "goal pace" (dropping by the weekly goal). Between them you're losing, below the
// goal line you're on or ahead of pace. Null when there's nothing to anchor to.
export const paceLines = (view, lbsPerWeek) => {
    if (view.range.bmiZones || !(lbsPerWeek > 0) || view.inRange.length === 0) {
        return null;
    }
    const start = { x: dayNumber(view.inRange[0].date), y: Number(view.inRange[0].lbs) };
    const goalAt = (x) => Math.round((start.y - lbsPerWeek * (x - start.x) / 7) * 10) / 10;
    return {
        flat: [start, { x: view.end, y: start.y }],
        goal: [start, { x: view.end, y: goalAt(view.end) }],
        goalAt,
    };
}

// Fixed targets for the period from its first weigh-in: `half` is half the goal loss
// for the period, `full` the whole of it. Null when there's nothing to anchor to.
export const goalLevels = (view, lbsPerWeek) => {
    if (view.range.bmiZones || !(lbsPerWeek > 0) || view.inRange.length === 0) {
        return null;
    }
    const start = Number(view.inRange[0].lbs);
    const goal = lbsPerWeek * view.range.days / 7;
    const level = (loss) => Math.round((start - loss) * 10) / 10;
    return { start, half: level(goal / 2), full: level(goal) };
}

// Week and month zoom in on your weigh-ins (and the goal lines) so small changes
// show. Year also takes in the nearest edge of the healthy BMI range, to show where
// you are relative to it.
export const yBounds = (view, heightIn, pace, levels) => {
    const values = view.points.map(el => el.y);
    if (pace) {
        values.push(...pace.goal.map(el => el.y));
    }
    if (levels) {
        values.push(levels.full);
    }
    if (view.range.bmiZones && heightIn) {
        const low = BMIBoundaries(18.5, heightIn);
        const high = BMIBoundaries(25, heightIn);
        if (Math.min(...values) > high) {
            values.push(high);
        } else if (Math.max(...values) < low) {
            values.push(low);
        } else {
            values.push(low, high);
        }
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(2, (max - min) * 0.1);
    return { min: Math.floor(min - pad), max: Math.ceil(max + pad) };
}
