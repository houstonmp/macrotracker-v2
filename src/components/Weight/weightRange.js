import { BMIBoundaries } from '../../assets/functions';

export const RANGES = [
    // Week and month are calendar periods (Sunday to Saturday, and the 1st to the end of
    // the month) so each has one fixed target. They page back with the chart's arrows.
    { id: 'week', label: 'Week', calendar: true },
    { id: 'month', label: 'Month', calendar: true },
    // A year of daily weigh-ins is mostly noise, so it's drawn as weekly averages.
    // The year shows BMI zones; week and month show progress against the weekly goal.
    { id: 'year', label: 'Year', days: 365, averageDays: 7, bmiZones: true },
];

const DAY_MS = 864e5;

// Dates are 'YYYY-MM-DD'; the chart's x axis counts whole days so gaps between
// weigh-ins are spaced by time, not evenly
export const dayNumber = (date) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;
export const dateFromDay = (day) => new Date(day * DAY_MS).toJSON().slice(0, 10);

// Average the weigh-ins in each block of `days`, placed at their average date so the
// newest block never lands past today
const averageBy = (points, start, days) => {
    const buckets = new Map();
    points.forEach(point => {
        const bucket = Math.floor((point.x - start) / days);
        buckets.set(bucket, [...(buckets.get(bucket) || []), point]);
    });
    const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
    return [...buckets.values()].map(bucket => ({
        x: mean(bucket.map(point => point.x)),
        y: Math.round(mean(bucket.map(point => point.y)) * 10) / 10,
    }));
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Day 0 (1970-01-01) was a Thursday, so a day's weekday is (day + 4) % 7 with Sunday as 0
const weekStart = (day) => day - ((day + 4) % 7);

// The days a period covers: `start` is its first day, `end` the day after its last.
// `offset` counts back from the period holding today: -1 is last week or last month.
export const periodBounds = (rangeId, today, offset = 0) => {
    if (rangeId === 'week') {
        const start = weekStart(today) + offset * 7;
        return { start, end: start + 7 };
    }
    if (rangeId === 'month') {
        const date = new Date(today * DAY_MS);
        const month = date.getUTCMonth() + offset;
        return {
            start: Date.UTC(date.getUTCFullYear(), month, 1) / DAY_MS,
            end: Date.UTC(date.getUTCFullYear(), month + 1, 1) / DAY_MS,
        };
    }
    return { start: today - 365, end: today + 1 };
}

const shortDay = (day) => new Date(day * DAY_MS).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

// "Oct 19 – 25", "Sep 28 – Oct 4" or "October 2026"
export const periodTitle = (rangeId, start, end) => {
    if (rangeId === 'week') {
        const first = new Date(start * DAY_MS);
        const last = new Date((end - 1) * DAY_MS);
        const lastLabel = first.getUTCMonth() === last.getUTCMonth() ? last.getUTCDate() : shortDay(end - 1);
        return `${shortDay(start)} – ${lastLabel}`;
    }
    if (rangeId === 'month') {
        const date = new Date(start * DAY_MS);
        return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    }
    return 'Past year';
}

// How a sentence refers to the period: "−1.4 lbs this week", "… last month", "… that week"
const periodPhrase = (rangeId, offset) => {
    if (rangeId === 'year') {
        return 'over the past year';
    }
    if (offset === 0) {
        return `this ${rangeId}`;
    }
    return offset === -1 ? `last ${rangeId}` : `that ${rangeId}`;
}

// The weigh-ins for one period. `points` also includes the last weigh-in before it and
// the first after it, so the line runs in from the edges instead of starting mid-chart.
export const weightView = (weights, rangeId, today, offset = 0) => {
    const range = RANGES.find(el => el.id === rangeId);
    const { start, end } = periodBounds(rangeId, today, offset);
    const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
    const inRange = sorted.filter(el => dayNumber(el.date) >= start && dayNumber(el.date) < end);
    const before = sorted.filter(el => dayNumber(el.date) < start).pop();
    const after = sorted.find(el => dayNumber(el.date) >= end);
    const toPoint = el => ({ x: dayNumber(el.date), y: Number(el.lbs) });
    let points = inRange.map(toPoint);
    if (range.averageDays) {
        points = averageBy(points, start, range.averageDays);
    }
    if (before) {
        points = [toPoint(before), ...points];
    }
    if (after) {
        points = [...points, toPoint(after)];
    }
    const change = inRange.length > 1
        ? Math.round((inRange[inRange.length - 1].lbs - inRange[0].lbs) * 10) / 10
        : null;
    const current = today < end;
    // The last day drawn: today for the period you're in, so it's a snapshot so far, and
    // the whole period for past ones. At least two days, so a Sunday or the 1st isn't a dot.
    const lastDay = Math.max(current ? today : end - 1, start + 1);
    return {
        range, offset, start, end, inRange, points, change, current, today, lastDay,
        // Half a day either side so the first and last dots aren't cut in half
        axis: { min: start - 0.5, max: lastDay + 0.5 },
        // Nothing to page back to before the first weigh-in
        hasEarlier: Boolean(range.calendar && sorted.length > 0 && dayNumber(sorted[0].date) < start),
        title: periodTitle(rangeId, start, end),
        phrase: periodPhrase(rangeId, offset),
    };
}

// Two lines from the first weigh-in in the period across the chart: "no change" (flat)
// and "goal pace" (dropping by the weekly goal). Between them you're losing, below the
// goal line you're on or ahead of pace. `target` is where goal pace ends the period,
// fixed from that first weigh-in, even when the chart stops at today.
// Null when there's nothing to anchor to.
export const paceLines = (view, lbsPerWeek) => {
    if (view.range.bmiZones || !(lbsPerWeek > 0) || view.inRange.length === 0) {
        return null;
    }
    const start = { x: dayNumber(view.inRange[0].date), y: Number(view.inRange[0].lbs) };
    const goalAt = (x) => Math.round((start.y - lbsPerWeek * (x - start.x) / 7) * 10) / 10;
    return {
        flat: [start, { x: view.axis.max, y: start.y }],
        goal: [start, { x: view.axis.max, y: goalAt(view.axis.max) }],
        goalAt,
        target: goalAt(view.end),
    };
}

// Fixed levels for the period from its first weigh-in: `full` is the period's target,
// `half` halfway to it. Null when there's nothing to anchor to.
export const goalLevels = (view, lbsPerWeek) => {
    const pace = paceLines(view, lbsPerWeek);
    if (!pace) {
        return null;
    }
    const start = pace.flat[0].y;
    return { start, half: Math.round((start + pace.target) / 2 * 10) / 10, full: pace.target };
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
