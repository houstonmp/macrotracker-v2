import { useSelector } from 'react-redux';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import { EmptyState } from '../UI/EntryList';
import { AwardIcon } from '../../assets/StatIcons';
import { formatDay, localDate } from '../../assets/functions';
import { selectDailyTargets, selectDiaryDate, selectDiaryDay, selectLatestWeight } from '../store/selectors';
import { splitEstimateCalories, unsplitCalories } from '../../assets/food';
import { waterGoal, waterTotal } from '../Water/water';
import { dayScore } from './dayScore';
import ScoreStat from '../UI/ScoreStat';
import { toneFor } from '../UI/scoreTone';
// Same layout and grade colours as the weight score card
import classes from '../Weight/WeightScore.module.css';

const ZONES = {
    in: 'In your range',
    over: 'Above your range, under maintenance',
    overTdee: 'Above maintenance',
    under: 'Under your BMR',
};

const HEADLINES = {
    calories: 'Calories had the most room to grow',
    protein: 'Protein had the most room to grow',
    balance: 'Carbs and fat were out of balance',
    logging: 'More of the day was estimated than logged',
};

const gradeClass = (grade) => classes[`grade${grade.replace('+', 'Plus')}`];
const kcal = (value) => Math.round(value).toLocaleString();

// The diary day's report card, worked out from what's logged and never saved
const DayScore = (props) => {
    const date = useSelector(selectDiaryDate);
    const day = useSelector(selectDiaryDay);
    const targets = useSelector(selectDailyTargets);
    const latestWeight = useSelector(selectLatestWeight);
    const isToday = date === localDate();
    const result = dayScore(day, targets, { inProgress: isToday });

    const subtitle = `${formatDay(date)} · ${isToday ? 'so far' : 'final score'}`;
    let empty = null;
    if (!targets) {
        empty = 'Add a weigh-in to get daily targets and a score.';
    } else if (day && day.untracked) {
        empty = 'Untracked day, so there\'s no score.';
    } else if (!result) {
        empty = `Log food ${isToday ? 'today' : 'on this day'} to get a score.`;
    }
    if (empty) {
        return <Card classes={props.classes}>
            <CardHeader Icon={AwardIcon} title="Day score" subtitle={subtitle} />
            <EmptyState>{empty}</EmptyState>
        </Card>
    }

    const goals = targets.dailyMacros;
    const { protein } = day.macros;
    const estimated = unsplitCalories(day) + splitEstimateCalories(day);
    const water = waterTotal(day);
    const waterTarget = latestWeight && waterGoal(latestWeight.kgs);
    const waterShare = waterTarget ? water / waterTarget : 0;
    // Today's water is still filling up, so it's only marked once the goal is met
    let waterTone = null;
    if (waterTarget && (!isToday || waterShare >= 1)) {
        waterTone = toneFor(Math.min(waterShare, 1) * 100);
    }

    return <Card classes={props.classes}>
        <CardHeader Icon={AwardIcon} title="Day score" subtitle={subtitle} />
        <div className={classes.summary}>
            <span className={`${classes.grade} ${gradeClass(result.grade)}`}>{result.grade}</span>
            <span className={classes.summaryText}>
                <span className={classes.headline}>{result.focus ? HEADLINES[result.focus.key] : 'A well-balanced day'}</span>
                <span>{result.score} of 100 · good range {kcal(result.range.low)}–{kcal(result.range.high)} kcal</span>
            </span>
        </div>
        <ul className={classes.stats}>
            <ScoreStat label="Calories" value={`${kcal(result.calories)} kcal`} tone={toneFor(result.parts.calories)}
                hint={result.zone === 'under' && isToday ? `${kcal(result.range.low - result.calories)} to your range` : ZONES[result.zone]} />
            <ScoreStat label="Protein" value={`${Math.round(protein)} / ${goals.goalProtein} g`} tone={toneFor(result.parts.protein)}
                hint={`${Math.round(protein / goals.goalProtein * 100)}% of goal`} />
            {result.split && <ScoreStat label="Macro split" value={`${result.split.protein} · ${result.split.carbs} · ${result.split.fat}`}
                tone={toneFor(result.parts.balance)}
                hint="% protein · carbs · fat, aiming for 40 · 40 · 20" />}
            <ScoreStat label="Logged with macros" value={`${Math.round(result.parts.logging)}%`} tone={toneFor(result.parts.logging)}
                hint={estimated > 0 ? `≈ ${kcal(estimated)} kcal estimated` : 'Nothing estimated'} />
            <ScoreStat label="Foods logged" value={day.food.length} />
            {waterTarget && <ScoreStat label="Water" value={`${Math.round(waterShare * 100)}%`} hint="of your drinks goal" tone={waterTone} />}
        </ul>
    </Card>
}

export default DayScore;
