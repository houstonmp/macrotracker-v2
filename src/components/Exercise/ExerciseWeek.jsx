import { useDispatch, useSelector } from 'react-redux';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import ScoreStat from '../UI/ScoreStat';
import { CalendarCheckIcon } from '../../assets/StatIcons';
import { formatDay, localDate } from '../../assets/functions';
import { uiActions } from '../store/ui-slice';
import { selectDiaryDate } from '../store/selectors';
import { exerciseGrade, formatMinutes, weekReport } from './exercise';
// Same stat grid as the day and weight score cards
import scoreClasses from '../Weight/WeightScore.module.css';
import classes from './Exercise.module.css';

// Sunday to Saturday with a check on each day you exercised, and the week's totals.
// It follows the diary day, so paging the diary back pages this back too.
const ExerciseWeek = (props) => {
    const dispatch = useDispatch();
    const date = useSelector(selectDiaryDate);
    const diaryObj = useSelector(state => state.fDiary.diaryObj);
    const today = localDate();
    const report = weekReport(diaryObj, date);
    const first = report.days[0].date;
    const last = report.days[6].date;
    const isThisWeek = today >= first && today <= last;
    const grade = exerciseGrade(report.activeDays);

    // Tapping a day opens it in the diaries; today goes back to following today
    const open = (day) => dispatch(uiActions.setDiaryDate(day === today ? null : day));

    return <Card classes={props.classes}>
        <CardHeader Icon={CalendarCheckIcon} title={isThisWeek ? 'This week' : 'Exercise week'}
            subtitle={`${formatDay(first, { weekday: false })} – ${formatDay(last, { weekday: false })}`} />
        <div className={scoreClasses.summary}>
            <span className={`${scoreClasses.grade} ${scoreClasses[`grade${grade.replace('+', 'Plus')}`]}`}>{grade}</span>
            <span className={scoreClasses.summaryText}>
                <span className={scoreClasses.headline}>{report.activeDays} workout {report.activeDays === 1 ? 'day' : 'days'}{isThisWeek ? ' so far' : ''}</span>
                <span>3 days is a C, 4 a B, 5 an A, 6 or more an A+</span>
            </span>
        </div>
        <ol className={classes.week}>
            {report.days.map(day => <li key={day.date}>
                <button type="button" disabled={day.date > today} aria-current={day.date === date ? 'date' : undefined}
                    className={`${classes.day} ${day.active ? classes.active : ''} ${day.date === date ? classes.selected : ''}`}
                    aria-label={`${formatDay(day.date)}: ${day.active ? `exercised, ${formatMinutes(day.minutes)}` : 'no exercise'}`}
                    onClick={() => open(day.date)}>
                    <span className={classes.dayLabel}>{day.label}</span>
                    <span className={classes.check} aria-hidden="true">{day.active ? '✓' : ''}</span>
                </button>
            </li>)}
        </ol>
        <ul className={scoreClasses.stats}>
            <ScoreStat label="Active days" value={`${report.activeDays} / 7`} hint={isThisWeek ? 'so far this week' : 'that week'} />
            <ScoreStat label="Exercise time" value={formatMinutes(report.minutes)} hint={`${report.count} ${report.count === 1 ? 'activity' : 'activities'}`} />
            <ScoreStat label="Burned" value={report.burned ? `${report.burned.toLocaleString()} kcal` : '—'}
                hint="Not taken off your calorie goal" />
            {report.rides > 0 && <ScoreStat label="Bike" value={`${report.rides} ${report.rides === 1 ? 'ride' : 'rides'}`}
                hint={report.distanceKm ? `${report.distanceKm} km` : undefined} />}
        </ul>
    </Card>
}

export default ExerciseWeek;
