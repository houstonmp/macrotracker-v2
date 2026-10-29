import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, Filler } from 'chart.js'
import { useState } from 'react';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import SegmentedControl from '../UI/SegmentedControl';
import { EmptyState } from '../UI/EntryList';
import { TrendIcon } from '../../assets/StatIcons';
import classes from './WeightChart.module.css';

import { useDispatch, useSelector } from "react-redux";
import { uiActions } from '../store/ui-slice';
import { BMIBoundaries, formatDay, localDate } from '../../assets/functions';
import { RANGES, dateFromDay, dayNumber, goalLevels, paceLines, weightView, yBounds } from './weightRange';

ChartJS.register(Filler);

// Year: the healthy BMI range is the target. Either side is tinted softly rather than in
// warning colours: a faint red below, then blue (BMI 25-30) and purple (30+) above.
// Week and month reuse the same colours for progress toward the weekly goal.
const HALF_GOAL_LINE = 'rgba(70, 130, 200, 0.6)';
// A little stronger than the year's purple so "where you are" stands apart from the blue
const START_FILL = 'rgba(140, 100, 200, 0.18)';

// Two ways to show week and month progress, chosen in the card and saved with settings
const GOAL_VIEWS = {
    pace: { label: 'Pace band', next: 'levels' },
    levels: { label: 'Goal lines', next: 'pace' },
};
const HEALTHY_LINE = 'rgba(76, 175, 120, 0.6)';
const HEALTHY_FILL = 'rgba(76, 175, 120, 0.15)';
const BELOW_FILL = 'rgba(220, 90, 90, 0.1)';
const ABOVE_FILL = 'rgba(70, 130, 200, 0.1)';
const WELL_ABOVE_FILL = 'rgba(140, 100, 200, 0.1)';

const tickLabel = (day, rangeId) => rangeId === 'year'
    ? new Date(`${dateFromDay(day)}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    : formatDay(dateFromDay(day), { weekday: false });

// Tick days for the x axis: every day for a week, about six for longer ranges. Today is
// always one, labelled "Today", with any tick crowding it dropped.
const tickDays = (view) => {
    const first = view.start;
    const last = Math.floor(view.lastDay);
    let days;
    if (view.range.id === 'week') {
        days = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    } else if (view.range.id === 'year') {
        days = [];
        const date = new Date(first * 864e5);
        for (let month = 1; month <= 13; month++) {
            const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + month, 1) / 864e5;
            day <= last && days.push(day);
        }
    } else {
        const step = Math.max(1, Math.ceil((last - first) / 5));
        days = [];
        for (let day = first; day <= last; day += step) {
            days.push(day);
        }
    }
    if (view.current) {
        const gap = view.range.id === 'week' ? 1 : view.range.id === 'year' ? 20 : 2;
        days = [...days.filter(day => Math.abs(day - view.today) >= gap), view.today];
    }
    return days;
}

const shortWeekday = (day) => new Date(day * 864e5).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

// Under the arrows: how far through the period you are and what it's aiming for.
// "Day 4 of 7 · Target 241.2 lbs by Sat · pace today 243.6"
const PeriodProgress = ({ view, pace }) => {
    const length = view.end - view.start;
    const day = view.current ? view.today - view.start + 1 : length;
    const endLabel = view.range.id === 'week'
        ? shortWeekday(view.end - 1)
        : formatDay(dateFromDay(view.end - 1), { weekday: false });
    let target = null;
    if (pace && view.current) {
        target = `Target ${pace.target} lbs by ${endLabel} · pace today ${pace.goalAt(view.today)}`;
    } else if (pace) {
        target = `Target was ${pace.target} lbs`;
    }
    return <div className={classes.progress}>
        <span className={classes.progressText}>
            <span>{view.current ? `Day ${day} of ${length}` : 'Final'}</span>
            {target && <span>{target}</span>}
        </span>
        <span className={classes.progressTrack}>
            <span className={classes.progressFill} style={{ width: `${day / length * 100}%` }} />
        </span>
    </div>
}

// "−1.4 lbs this week · on goal pace" or "… · in the green"
const subtitleFor = (view, pace, levels) => {
    if (view.change === null) {
        return view.inRange.length === 1 ? `1 weigh-in ${view.phrase}` : `No weigh-ins ${view.phrase}`;
    }
    const sign = view.change > 0 ? '+' : view.change < 0 ? '−' : '±';
    const summary = `${sign}${Math.abs(view.change)} lbs ${view.phrase}`;
    const latest = view.inRange[view.inRange.length - 1];
    if (levels) {
        // Only ever says where you've got to, never how far behind
        const zone = latest.lbs <= levels.full ? 'in the green' : latest.lbs <= levels.half ? 'in the blue' : '';
        return zone ? `${summary} · ${zone}` : summary;
    }
    if (!pace) {
        return summary;
    }
    const behind = Math.round((latest.lbs - pace.goalAt(dayNumber(latest.date))) * 10) / 10;
    return `${summary} · ${behind <= 0 ? 'on goal pace' : `${behind} lbs behind goal pace`}`;
}

// The range and period can be passed in, so Insights' score card follows the chart;
// on its own (Home) the chart keeps them itself
const WeightChart = (props) => {
    const dispatch = useDispatch();
    const [ownRange, setOwnRange] = useState('month');
    const [ownOffset, setOwnOffset] = useState(0);
    const rangeId = props.rangeId || ownRange;
    const offset = props.offset !== undefined ? props.offset : ownOffset;
    const setOffset = props.onOffsetChange || setOwnOffset;
    const setRangeId = (id) => {
        (props.onRangeChange || setOwnRange)(id);
        // A new range starts back at the current period
        setOffset(0);
    }
    const settings = useSelector(state => state.ui.userPreferences.settings) || {};
    const goalView = GOAL_VIEWS[settings.weightGoalView] ? settings.weightGoalView : 'pace';
    const theme = useSelector(state => state.ui.userPreferences.theme.lightMode);
    const user = useSelector(state => state.ui.userPreferences.user)
    const weightObj = useSelector(state => state.weight.weightObj);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#E6F1F8' : '#000B13';
    const gridColor = isDark ? 'rgba(230, 241, 248, 0.1)' : 'rgba(0, 11, 19, 0.08)';
    const referenceLine = isDark ? 'rgba(230, 241, 248, 0.3)' : 'rgba(0, 11, 19, 0.25)';
    const weightLine = isDark ? '#E6F1F8' : '#005083';
    // The latest dot is a ring: the card's colour inside, the line's around
    const cardColor = (typeof document !== 'undefined'
        && getComputedStyle(document.body).getPropertyValue('--color-gamma-100').trim()) || (isDark ? '#16202a' : '#ffffff');

    const view = weightView(weightObj, rangeId, dayNumber(localDate()), offset);
    const heightIn = user.height && user.height.in;
    const lbsPerWeek = user.weightDeficit && Number(user.weightDeficit.lbs);
    const pace = goalView === 'pace' ? paceLines(view, lbsPerWeek) : null;
    const levels = goalView === 'levels' ? goalLevels(view, lbsPerWeek) : null;
    const bounds = view.points.length > 0 ? yBounds(view, heightIn, pace, levels) : {};

    // Horizontal lines across the whole range, like the BMI lines
    const across = (y) => [{ x: view.axis.min, y }, { x: view.axis.max, y }];
    // For the target text, whichever goal view is showing
    const targetPace = paceLines(view, lbsPerWeek);
    const ticks = tickDays(view);
    // Where you are now: the latest weigh-in of the current period, drawn a little larger
    const latestX = view.current && view.inRange.length > 0
        ? Math.max(...view.points.filter(point => point.x <= view.today).map(point => point.x))
        : null;
    const pointRadius = view.points.length > 40 ? 0 : 3;
    const weighInMarks = view.range.calendar && bounds.min !== undefined
        ? [...new Set(view.inRange.map(el => dayNumber(el.date)))]
            .map(x => ({ x, y: bounds.min + (bounds.max - bounds.min) * 0.02 }))
        : [];

    const boundary = (bmi) => heightIn ? across(BMIBoundaries(bmi, heightIn)) : [];
    const bmiOf = (lbs) => Math.round((lbs / (heightIn * heightIn)) * 703 * 10) / 10;

    const referenceDataset = { pointRadius: 0, pointHitRadius: 0, borderWidth: 1 };

    // Year: each BMI line spans the whole range; the fills between them colour the zones
    const bmiDatasets = [
        {
            ...referenceDataset,
            label: 'BMI 18.5',
            data: boundary(18.5),
            borderColor: HEALTHY_LINE,
            backgroundColor: BELOW_FILL,
            fill: 'start',
        },
        {
            ...referenceDataset,
            label: 'BMI 25',
            data: boundary(25),
            borderColor: HEALTHY_LINE,
            backgroundColor: HEALTHY_FILL,
            // Fill down to the BMI 18.5 line, shading only the healthy range
            fill: '-1',
        },
        {
            ...referenceDataset,
            label: 'BMI 30',
            data: boundary(30),
            borderColor: referenceLine,
            borderDash: [4, 4],
            backgroundColor: ABOVE_FILL,
            // Fill down to the BMI 25 line
            fill: '-1',
        },
        {
            // A line can only fill one area, so an invisible copy of the
            // BMI 30 line tints everything above it
            ...referenceDataset,
            label: 'Above BMI 30',
            data: boundary(30),
            borderWidth: 0,
            backgroundColor: WELL_ABOVE_FILL,
            fill: 'end',
        },
    ];

    const paceDatasets = pace && [
        {
            ...referenceDataset,
            label: 'No change',
            data: pace.flat,
            borderColor: referenceLine,
            borderDash: [4, 4],
        },
        {
            // Blue between no change and goal pace: losing, slower than the goal
            ...referenceDataset,
            label: 'Goal pace',
            data: pace.goal,
            borderColor: HEALTHY_LINE,
            backgroundColor: ABOVE_FILL,
            fill: '-1',
        },
        {
            // Green below goal pace; an invisible copy because a line fills one area
            ...referenceDataset,
            label: 'Ahead of goal pace',
            data: pace.goal,
            borderWidth: 0,
            backgroundColor: HEALTHY_FILL,
            fill: 'start',
        },
    ];

    // Goal lines: green below the full goal, blue from half to full, purple above half
    const levelDatasets = levels && [
        {
            ...referenceDataset,
            label: 'Full goal',
            data: across(levels.full),
            borderColor: HEALTHY_LINE,
            backgroundColor: HEALTHY_FILL,
            fill: 'start',
        },
        {
            ...referenceDataset,
            label: 'Half goal',
            data: across(levels.half),
            borderColor: HALF_GOAL_LINE,
            backgroundColor: ABOVE_FILL,
            fill: '-1',
        },
        {
            // Invisible copy of the half-goal line to tint everything above it
            ...referenceDataset,
            label: 'Above half goal',
            data: across(levels.half),
            borderWidth: 0,
            backgroundColor: START_FILL,
            fill: 'end',
        },
    ];

    const onGoalViewHandler = () => {
        dispatch(uiActions.updateSettings({ weightGoalView: GOAL_VIEWS[goalView].next }));
    }

    return <Card classes={`${classes.chart} ${props.classes || ''}`}>
        <CardHeader Icon={TrendIcon} title="Weight trend" subtitle={subtitleFor(view, pace, levels)}>
            {!view.range.bmiZones && <button type="button" onClick={onGoalViewHandler}
                title={`Switch to ${GOAL_VIEWS[GOAL_VIEWS[goalView].next].label.toLowerCase()}`}>
                {GOAL_VIEWS[goalView].label} ⇄
            </button>}
        </CardHeader>
        <SegmentedControl label="Chart range" value={rangeId} onChange={setRangeId}
            options={RANGES.map(range => ({ id: range.id, label: range.label }))} />

        {view.range.calendar && <div className={classes.periodNav}>
            <button type="button" aria-label={`Previous ${rangeId}`} disabled={!view.hasEarlier}
                onClick={() => setOffset(offset - 1)}>‹</button>
            <span className={classes.periodTitle}>
                {view.title}
                {offset !== 0 && <button type="button" className={classes.backToNow} onClick={() => setOffset(0)}>
                    Back to this {rangeId}
                </button>}
            </span>
            <button type="button" aria-label={`Next ${rangeId}`} disabled={view.current}
                onClick={() => setOffset(offset + 1)}>›</button>
        </div>}
        {view.range.calendar && <PeriodProgress view={view} pace={targetPace} />}

        {view.inRange.length === 0 ? <EmptyState>No weigh-ins {view.phrase}.</EmptyState> :
            // The box sets the height; a fixed aspect ratio made the chart unreadably short on phones
            <div className={classes.chartBox}>
                <Chart type='line' options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    color: textColor,
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            // Only the weight line; the BMI lines are backdrop
                            filter: (item) => item.datasetIndex === 0,
                            callbacks: {
                                title: (items) => items.length > 0 ? formatDay(dateFromDay(items[0].parsed.x)) : '',
                                label: (item) => `${view.range.averageDays ? 'Week average ' : ''}${item.parsed.y} lbs`
                                    + (heightIn ? ` · BMI ${bmiOf(item.parsed.y)}` : ''),
                                afterLabel: (item) => pace && item.parsed.x >= pace.flat[0].x
                                    ? `Goal pace: ${pace.goalAt(item.parsed.x)} lbs`
                                    : '',
                            }
                        },
                    },
                    scales: {
                        x: {
                            // Days, so weigh-ins are spaced by the time between them
                            type: 'linear',
                            min: view.axis.min,
                            max: view.axis.max,
                            grid: { color: gridColor },
                            afterBuildTicks: (scale) => {
                                scale.ticks = ticks.map(value => ({ value }));
                            },
                            ticks: {
                                color: textColor,
                                autoSkip: false,
                                maxRotation: 0,
                                callback: (value) => view.current && value === view.today ? 'Today' : tickLabel(value, rangeId),
                                font: (context) => context.tick && view.current && context.tick.value === view.today
                                    ? { weight: 'bold' }
                                    : {},
                            }
                        },
                        y: {
                            min: bounds.min,
                            max: bounds.max,
                            grid: { color: gridColor },
                            ticks: { color: textColor }
                        }
                    }
                }}
                    data={{
                        datasets: [
                            {
                                label: 'Weight (lbs)',
                                data: view.points,
                                borderColor: weightLine,
                                backgroundColor: weightLine,
                                borderWidth: 2,
                                // Smooth, but never curving past a real weigh-in
                                cubicInterpolationMode: 'monotone',
                                // Dots get crowded with lots of weigh-ins; the latest stays visible
                                pointRadius: (context) => context.raw && context.raw.x === latestX ? 6 : pointRadius,
                                pointBorderWidth: (context) => context.raw && context.raw.x === latestX ? 3 : 1,
                                pointBackgroundColor: (context) => context.raw && context.raw.x === latestX ? cardColor : weightLine,
                                pointHoverRadius: 6,
                            },
                            ...(paceDatasets || levelDatasets || bmiDatasets),
                            {
                                // A faint mark along the bottom for each day with a weigh-in,
                                // so days without one read as gaps. Last, so the
                                // fills above can keep pointing at the dataset before them
                                label: 'Weigh-in days',
                                data: weighInMarks,
                                showLine: false,
                                pointStyle: 'rectRounded',
                                pointRadius: 3,
                                pointHoverRadius: 3,
                                pointHitRadius: 0,
                                borderWidth: 0,
                                backgroundColor: referenceLine,
                            },
                        ]
                    }} />
            </div>}
    </Card>

}

export default WeightChart;
