import { localDate, shiftDate } from '../../assets/functions';

// Quick picks for the name; anything can be typed instead
export const EXERCISE_TYPES = ['Walk', 'Run', 'Bike ride', 'Strength', 'Swim', 'Yoga', 'Sport'];

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const dayExercise = (day) => (day && day.exercise) || [];

// Minutes and calories for a list of entries. Calories only count entries that have them,
// and `burned` is null when none do, so "no number" doesn't read as zero.
export const exerciseTotals = (entries) => {
    const withCalories = entries.filter(el => el.calories > 0);
    return {
        count: entries.length,
        minutes: Math.round(entries.reduce((sum, el) => sum + (Number(el.minutes) || 0), 0)),
        burned: withCalories.length > 0 ? Math.round(withCalories.reduce((sum, el) => sum + el.calories, 0)) : null,
    };
}

// "1 h 25 min", "45 min"
export const formatMinutes = (minutes) => {
    const total = Math.round(minutes);
    if (total < 60) {
        return `${total} min`;
    }
    const rest = total % 60;
    return `${Math.floor(total / 60)} h${rest ? ` ${rest} min` : ''}`;
}

// Sunday to Saturday around a 'YYYY-MM-DD' date, the same weeks the weight chart uses
export const weekOf = (date) => {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const sunday = shiftDate(date, -weekday);
    return WEEKDAYS.map((label, i) => ({ label, date: shiftDate(sunday, i) }));
}

// Exercise over any run of dates (a week, a month): each day, the totals, and how many
// days had any exercise
export const periodExercise = (diaryObj, dates) => {
    const days = dates.map(date => {
        const entries = dayExercise(diaryObj.find(el => el.date === date));
        return { date, entries, active: entries.length > 0, ...exerciseTotals(entries) };
    });
    const entries = days.flatMap(day => day.entries);
    const rides = entries.filter(el => el.source === 'bike');
    return {
        days,
        activeDays: days.filter(day => day.active).length,
        ...exerciseTotals(entries),
        rides: rides.length,
        distanceKm: Math.round(rides.reduce((sum, el) => sum + ((el.stats && el.stats.distanceKm) || 0), 0) * 10) / 10,
    };
}

export const weekReport = (diaryObj, date) => {
    const week = weekOf(date);
    const report = periodExercise(diaryObj, week.map(day => day.date));
    return { ...report, days: report.days.map((day, i) => ({ ...day, label: week[i].label })) };
}

// A ride summary from the bike bridge, as a diary entry on the day it started (your time zone)
export const rideEntry = (ride) => ({
    date: localDate(new Date(ride.start)),
    entry: {
        id: ride.id,
        name: 'Bike ride',
        minutes: ride.minutes,
        calories: ride.calories,
        source: 'bike',
        start: ride.start,
        stats: {
            distanceKm: ride.distanceKm,
            avgPower: ride.avgPower,
            maxPower: ride.maxPower,
            avgCadence: ride.avgCadence,
            avgSpeed: ride.avgSpeed,
            avgHeartRate: ride.avgHeartRate,
        },
    },
});

// Rides waiting on the bridge: ones already in the diary you loaded have been saved, so the
// bridge can delete them; the rest get added (and are deleted the next time FitPad loads).
export const planRideSync = (rides, diaryObj) => {
    const saved = new Set(diaryObj.flatMap(day => dayExercise(day).map(el => el.id)));
    return {
        toAdd: rides.filter(ride => !saved.has(ride.id)).map(rideEntry),
        toDelete: rides.filter(ride => saved.has(ride.id)).map(ride => ride.id),
    };
}

// The bike's numbers for a ride, short enough for one line
export const rideDetail = (stats) => [
    stats.distanceKm ? `${stats.distanceKm} km` : null,
    stats.avgPower ? `${stats.avgPower} W avg` : null,
    stats.avgCadence ? `${stats.avgCadence} rpm` : null,
    stats.avgHeartRate ? `${stats.avgHeartRate} bpm` : null,
].filter(Boolean).join(' · ');

// The grade from workout days a week: any session counts, walks included. 3 days is a C,
// 4 a B, 5 an A, 6 or 7 an A+, and never lower than D. Longer periods use their average.
export const exerciseGrade = (daysPerWeek) => {
    if (daysPerWeek >= 6) {
        return 'A+';
    }
    if (daysPerWeek >= 5) {
        return 'A';
    }
    if (daysPerWeek >= 4) {
        return 'B';
    }
    return daysPerWeek >= 3 ? 'C' : 'D';
}
