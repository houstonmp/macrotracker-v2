import { useSelector } from 'react-redux';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import { AwardIcon } from '../../assets/StatIcons';
import { selectDailyTargets } from '../store/selectors';
import { formatMinutes } from '../Exercise/exercise';
import { periodReport } from './periodReport';
// Same grade circles as the weight and day scores
import scoreClasses from '../Weight/WeightScore.module.css';
import classes from './ReportCard.module.css';

const gradeClass = (grade) => scoreClasses[`grade${grade.replace('+', 'Plus')}`];
const signed = (value) => `${value > 0 ? '+' : value < 0 ? '−' : '±'}${Math.abs(value)} lbs`;

// The numbers behind each grade, shown on hover so the row stays small
const foodDetail = (food, hasTargets) => {
    if (!hasTargets) {
        return 'Add a weigh-in to get daily targets';
    }
    if (!food) {
        return 'No food logged';
    }
    return `${food.score} average day score over ${food.days} ${food.days === 1 ? 'day' : 'days'}, ${food.calories.toLocaleString()} kcal a day`;
}

const weightDetail = (weight) => {
    if (!weight) {
        return 'No weigh-ins';
    }
    if (weight.change === null) {
        return 'One weigh-in so far: weigh in again for a grade';
    }
    if (!weight.grade) {
        return `${signed(weight.change)}; set a weekly goal for a grade`;
    }
    return `${signed(weight.change)}, ${weight.onPace ? 'on goal pace' : 'under goal pace'}`;
}

const workoutDetail = (workouts) => `${workouts.activeDays} workout ${workouts.activeDays === 1 ? 'day' : 'days'}, `
    + `${workouts.perWeek} a week${workouts.minutes ? `, ${formatMinutes(workouts.minutes)}` : ''}`;

// One circle and its name
const Grade = ({ label, grade, detail }) => <li className={classes.item} title={detail}>
    <span className={`${scoreClasses.miniGrade} ${grade ? gradeClass(grade) : ''}`}>{grade || '–'}</span>
    <span className={classes.label}>{label}</span>
</li>

// Food, weight and workouts graded for the week, month or year picked on the weight chart,
// and overall as their average
const ReportCard = ({ rangeId, offset, classes: cardClasses }) => {
    const diaryObj = useSelector(state => state.fDiary.diaryObj);
    const weights = useSelector(state => state.weight.weightObj);
    const user = useSelector(state => state.ui.userPreferences.user);
    const targets = useSelector(selectDailyTargets);
    const lbsPerWeek = user.weightDeficit && Number(user.weightDeficit.lbs);
    const report = periodReport({ diaryObj, weights, targets, lbsPerWeek }, rangeId, offset);
    const { food, weight, workouts, overall } = report;

    return <Card classes={cardClasses}>
        <CardHeader Icon={AwardIcon} title="Report card" subtitle={`${report.title} · ${report.current ? 'so far' : 'final'}`} />
        <ul className={classes.row}>
            <Grade label="Food" grade={food && food.grade} detail={foodDetail(food, Boolean(targets))} />
            <Grade label="Weight" grade={weight && weight.grade} detail={weightDetail(weight)} />
            <Grade label="Workouts" grade={workouts.grade} detail={workoutDetail(workouts)} />
            <Grade label="Overall" grade={overall} detail="The average of the grades to its left" />
        </ul>
    </Card>
}

export default ReportCard;
