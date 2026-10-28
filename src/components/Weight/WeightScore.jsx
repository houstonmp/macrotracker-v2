import { useSelector } from 'react-redux';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import { EmptyState } from '../UI/EntryList';
import { AwardIcon } from '../../assets/StatIcons';
import { localDate } from '../../assets/functions';
import { selectDailyTargets } from '../store/selectors';
import { dayNumber } from './weightRange';
import { loggedCalories, periodScore, targetStreak } from './weightScore';
import classes from './WeightScore.module.css';

const signed = (value, unit = 'lbs') => `${value > 0 ? '+' : value < 0 ? '−' : '±'}${Math.abs(value)} ${unit}`;

// Grade colours run green to blue to purple to grey, never red
const gradeClass = (grade) => classes[`grade${grade.replace('+', 'Plus')}`];

const Stat = ({ label, value, hint }) => <li className={classes.stat}>
    <span className={classes.statLabel}>{label}</span>
    <span className={classes.statValue}>{value}</span>
    {hint && <span className={classes.statHint}>{hint}</span>}
</li>

const headline = (period) => {
    if (period.score.met) {
        return 'Target met';
    }
    if (period.score.onPace) {
        return 'On goal pace';
    }
    return `${period.score.toTarget} lbs from target`;
}

// The year: each month's grade, newest first
const MonthByMonth = ({ weights, today, lbsPerWeek }) => {
    const months = Array.from({ length: 12 }, (_, i) => periodScore(weights, 'month', today, -i, lbsPerWeek))
        .filter(period => period.weighIns > 0);
    if (months.length === 0) {
        return <EmptyState>No weigh-ins in the past year.</EmptyState>;
    }
    return <ul className={classes.months}>
        {months.map(period => <li key={period.view.start} className={classes.month}>
            <span className={`${classes.miniGrade} ${period.score ? gradeClass(period.score.grade) : ''}`}>
                {period.score ? period.score.grade : '–'}
            </span>
            <span className={classes.monthName}>{period.view.title}</span>
            <span className={classes.monthChange}>{period.change !== undefined && period.weighIns > 1 ? signed(period.change) : '1 weigh-in'}</span>
        </li>)}
    </ul>
}

// The report card for the week or month picked on the weight chart
const WeightScore = ({ rangeId, offset }) => {
    const weights = useSelector(state => state.weight.weightObj);
    const diary = useSelector(state => state.fDiary.diaryObj);
    const user = useSelector(state => state.ui.userPreferences.user);
    const targets = useSelector(selectDailyTargets);
    const today = dayNumber(localDate());
    const lbsPerWeek = user.weightDeficit && Number(user.weightDeficit.lbs);

    if (rangeId === 'year') {
        return <Card classes={classes.card}>
            <CardHeader Icon={AwardIcon} title="Weight score" subtitle="Month by month for the past year" />
            <MonthByMonth weights={weights} today={today} lbsPerWeek={lbsPerWeek} />
        </Card>
    }

    const period = periodScore(weights, rangeId, today, offset, lbsPerWeek);
    const previous = periodScore(weights, rangeId, today, offset - 1, lbsPerWeek);
    const calories = loggedCalories(diary, rangeId, today, offset);
    const streak = offset === 0 ? targetStreak(weights, rangeId, today, lbsPerWeek) : 0;
    const { view, pace } = period;
    // Days of the period that have happened, today included
    const daysSoFar = Math.min(view.end, today + 1) - view.start;

    const subtitle = `${view.title} · ${view.current ? 'in progress' : 'final score'}`;

    if (period.weighIns === 0) {
        return <Card classes={classes.card}>
            <CardHeader Icon={AwardIcon} title="Weight score" subtitle={subtitle} />
            <EmptyState>No weigh-ins {view.phrase}.</EmptyState>
        </Card>
    }

    let summary;
    if (period.score) {
        summary = <div className={classes.summary}>
            <span className={`${classes.grade} ${gradeClass(period.score.grade)}`}>{period.score.grade}</span>
            <span className={classes.summaryText}>
                <span className={classes.headline}>{headline(period)}</span>
                <span>Started at {period.first} lbs · target {pace.target} lbs</span>
                {streak > 1 && <span className={classes.streak}>{streak} {rangeId}s in a row on target</span>}
            </span>
        </div>
    } else {
        summary = <p className={classes.note}>
            {!(lbsPerWeek > 0) && 'Set a weekly goal to get a grade.'}
            {lbsPerWeek > 0 && (view.current
                ? `Weigh in again this ${rangeId} to get a grade. Target: ${pace.target} lbs.`
                : `Only one weigh-in ${view.phrase}, so there's no grade.`)}
        </p>
    }

    return <Card classes={classes.card}>
        <CardHeader Icon={AwardIcon} title="Weight score" subtitle={subtitle} />
        {summary}
        <ul className={classes.stats}>
            {period.weighIns > 1 && <Stat label="Net change" value={signed(period.change)} hint={`${period.first} → ${period.last} lbs`} />}
            {period.score && <Stat label="Goal pace" value={`${Math.round(period.score.ratio * 100)}%`}
                hint={`${lbsPerWeek} ${lbsPerWeek === 1 ? 'lb' : 'lbs'} a week is 100%`} />}
            {period.perWeek !== undefined && <Stat label="Average rate" value={signed(period.perWeek, 'lbs/wk')} />}
            {period.kcalPerDay !== undefined && <Stat label={period.kcalPerDay >= 0 ? 'Daily deficit' : 'Daily surplus'}
                value={`≈ ${Math.abs(period.kcalPerDay)} kcal`} hint="From the scale, at 3,500 kcal a pound" />}
            <Stat label="Lowest" value={`${period.low} lbs`} />
            <Stat label="Weigh-in days" value={`${period.weighInDays} of ${daysSoFar}`}
                hint={view.current ? 'so far' : null} />
            {calories && <Stat label="Calories logged" value={`${calories.average} kcal`}
                hint={`a day, over ${calories.days} ${calories.days === 1 ? 'day' : 'days'}${targets ? ` · goal ${targets.dailyMacros.goalCalories}` : ''}`} />}
            {previous.weighIns > 1 && period.weighIns > 1 && <Stat label={`vs the ${rangeId} before`}
                value={signed(Math.round((period.change - previous.change) * 10) / 10)}
                hint={`It was ${signed(previous.change)}${previous.score ? ` · ${previous.score.grade}` : ''}`} />}
        </ul>
    </Card>
}

export default WeightScore;
