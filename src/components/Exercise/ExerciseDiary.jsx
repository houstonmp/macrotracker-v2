import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import EntryRow, { EntryList, EmptyState } from '../UI/EntryList';
import { BoltIcon } from '../../assets/StatIcons';
import { formatDay, localDate } from '../../assets/functions';
import { createId } from '../../assets/food';
import { foodDiaryActions } from '../store/food-diary-slice';
import { selectDiaryDate, selectDiaryDay } from '../store/selectors';
import { DayNav } from '../Entry/FoodDiary';
import { EXERCISE_TYPES, dayExercise, exerciseTotals, formatMinutes, rideDetail } from './exercise';
import classes from './Exercise.module.css';

const subtitleFor = (date, totals) => {
    if (totals.count === 0) {
        return formatDay(date);
    }
    const burned = totals.burned ? ` · ${totals.burned.toLocaleString()} kcal` : '';
    return `${formatDay(date)} · ${formatMinutes(totals.minutes)}${burned}`;
}

// What you did on the diary day, like the food diary: the same ‹ › days, bike rides added
// by themselves, and anything else logged by name and minutes
const ExerciseDiary = (props) => {
    const dispatch = useDispatch();
    const date = useSelector(selectDiaryDate);
    const entries = dayExercise(useSelector(selectDiaryDay));
    const isToday = date === localDate();
    const [name, setName] = useState('');
    const [minutes, setMinutes] = useState('');
    const [calories, setCalories] = useState('');
    const canAdd = name.trim() !== '' && Number(minutes) > 0;

    const onSubmitHandler = (e) => {
        e.preventDefault();
        if (!canAdd) {
            return;
        }
        dispatch(foodDiaryActions.addExercise({
            date,
            entry: {
                id: createId(),
                name: name.trim(),
                minutes: Math.round(Number(minutes)),
                // Left empty when you don't know: no number is better than a guess
                calories: Number(calories) > 0 ? Math.round(Number(calories)) : null,
                source: 'manual',
            },
        }));
        setName('');
        setMinutes('');
        setCalories('');
    }

    return <Card classes={props.classes}>
        <CardHeader Icon={BoltIcon} title="Exercise diary" subtitle={subtitleFor(date, exerciseTotals(entries))} />
        <DayNav />
        {entries.length > 0 ? <EntryList>
            {entries.map(entry => <EntryRow key={entry.id}
                name={entry.name}
                detail={`${formatMinutes(entry.minutes)}${entry.source === 'bike' ? ' · from the bike' : ''}`}
                extra={entry.stats && rideDetail(entry.stats) && <span className={classes.rideStats}>{rideDetail(entry.stats)}</span>}
                value={entry.calories ? Math.round(entry.calories) : '—'} unit={entry.calories ? 'kcal' : undefined}
                onDelete={() => dispatch(foodDiaryActions.removeExercise({ date, id: entry.id }))}
                deleteLabel={`Remove ${entry.name}`} />)}
        </EntryList> : <EmptyState>No exercise logged {isToday ? 'yet today' : 'on this day'}.</EmptyState>}

        <form className={classes.form} onSubmit={onSubmitHandler}>
            <div className={classes.pills} role="group" aria-label="Exercise type">
                {EXERCISE_TYPES.map(type => <button key={type} type="button" aria-pressed={name === type}
                    className={name === type ? classes.picked : ''} onClick={() => setName(type)}>{type}</button>)}
            </div>
            <div className={classes.fields}>
                <label className={classes.wide}>
                    <span>Exercise</span>
                    <input value={name} placeholder="Walk, squats, tennis…" onChange={e => setName(e.target.value)} />
                </label>
                <label>
                    <span>Minutes</span>
                    <input type="number" min="1" step="1" inputMode="numeric" value={minutes} onChange={e => setMinutes(e.target.value)} />
                </label>
                <label>
                    <span>kcal <small>if known</small></span>
                    <input type="number" min="0" step="1" inputMode="numeric" value={calories} onChange={e => setCalories(e.target.value)} />
                </label>
                <button type="submit" className={classes.add} disabled={!canAdd}>Add</button>
            </div>
        </form>
    </Card>
}

export default ExerciseDiary;
