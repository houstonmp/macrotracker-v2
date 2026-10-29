import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from '../../Form/Form';
import formClasses from '../../Form/Form.module.css';
import { foodDiaryActions } from '../../store/food-diary-slice';
import { selectDiaryDate } from '../../store/selectors';
import { ESTIMATE_TYPES, createId, estimateMacros } from '../../../assets/food';
import MacroSummary from '../../Form/MacroSummary';
import { formatDay, localDate } from '../../../assets/functions';
import classes from './EntryCard.module.css';

// Rough sizes for when there's no label to read, like takeout or a big night
const ESTIMATES = [
    { id: 'snack', label: 'Snack', calories: 300 },
    { id: 'meal', label: 'Meal', calories: 700 },
    { id: 'big', label: 'Big meal', calories: 1200 },
    { id: 'feast', label: 'Feast', calories: 2000 },
];

// The pills at the top of Meals: one per size, plus your own number
export const EstimatePills = ({ onPick }) => <div className={classes.estimates}>
    <span className={classes.estimatesLabel}>Quick estimate</span>
    <div className={classes.pills}>
        {ESTIMATES.map(el => <button key={el.id} type="button" onClick={() => onPick(el)}>
            {el.label} <small>~{el.calories.toLocaleString()}</small>
        </button>)}
        <button type="button" onClick={() => onPick(null)}>Other…</button>
    </div>
</div>

const KNOWN = [
    { id: 'protein', label: 'Protein (g)' },
    { id: 'carbs', label: 'Carbs (g)' },
    { id: 'fat', label: 'Fat (g)' },
];

// Macros come first: picking a food type splits the calories into a typical protein,
// carbs and fat share, and if you know the macros (some menus list them) they're used
// as they are. "Not sure" logs calories alone, and the day's macro totals say so.
const QuickEstimate = ({ preset }) => {
    const dispatch = useDispatch();
    const date = useSelector(selectDiaryDate);
    const [size, setSize] = useState(preset ? preset.id : null);
    const [calories, setCalories] = useState(preset ? String(preset.calories) : '');
    const [note, setNote] = useState('');
    // null until picked; 'unknown' is "Not sure", which leaves the macros out
    const [type, setType] = useState(null);
    const [known, setKnown] = useState({ protein: '', carbs: '', fat: '' });

    const knowsMacros = type === 'known';
    let macros;
    if (knowsMacros) {
        const grams = Object.fromEntries(KNOWN.map(el => [el.id, Number(known[el.id]) || 0]));
        // From the macros themselves, so the two can't disagree
        macros = { calories: Math.round(grams.protein * 4 + grams.carbs * 4 + grams.fat * 9), ...grams };
    } else {
        macros = estimateMacros(Math.round(Number(calories) || 0), type);
    }
    const formIsValid = type !== null && macros.calories > 0;
    const chosenType = ESTIMATE_TYPES.find(el => el.id === type);

    const onSizeHandler = (el) => {
        setSize(el.id);
        setCalories(String(el.calories));
    }

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        const chosen = ESTIMATES.find(el => el.id === size);
        const name = note.trim() || (chosenType && chosenType.label) || (chosen ? chosen.label : 'Quick estimate');
        let amount = 'Calories only';
        if (knowsMacros) {
            amount = 'Macros entered';
        } else if (chosenType) {
            amount = `Estimated as ${chosenType.label.toLowerCase()}`;
        }
        dispatch(foodDiaryActions.addFood({
            date,
            entry: {
                id: createId(),
                name,
                amount,
                macros,
                // Entered macros are real numbers, not an estimate
                ...(knowsMacros ? {} : { estimate: true }),
                ...(chosenType ? { estimateType: chosenType.id } : {}),
            },
        }));
        return true;
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid} submitText="Log estimate">
        <li>
            <label>What kind of food?</label>
            <div className={classes.pills}>
                {ESTIMATE_TYPES.map(el => <button key={el.id} type="button" aria-pressed={type === el.id}
                    className={type === el.id ? classes.pillActive : ''} onClick={() => setType(el.id)}>
                    {el.label}
                </button>)}
                <button type="button" aria-pressed={knowsMacros} className={knowsMacros ? classes.pillActive : ''}
                    onClick={() => setType('known')}>I know the macros</button>
                <button type="button" aria-pressed={type === 'unknown'} className={type === 'unknown' ? classes.pillActive : ''}
                    onClick={() => setType('unknown')}>Not sure</button>
            </div>
            <p className={formClasses.note}>
                {type === 'unknown'
                    ? "Logs calories only. The day's protein, carbs and fat will show as incomplete."
                    : 'Splits the calories into typical protein, carbs and fat for that kind of food.'}
            </p>
        </li>
        {knowsMacros ? <li>
            <ul className={formClasses.group}>
                {KNOWN.map(el => <li key={el.id}>
                    <label htmlFor={`known-${el.id}`}>{el.label}</label>
                    <input id={`known-${el.id}`} type="number" min="0" step="any" inputMode="decimal" value={known[el.id]}
                        onChange={e => setKnown({ ...known, [el.id]: e.target.value })} />
                </li>)}
            </ul>
        </li> : <>
        <li>
            <label>About how big?</label>
            <div className={classes.pills}>
                {ESTIMATES.map(el => <button key={el.id} type="button" aria-pressed={size === el.id}
                    className={size === el.id ? classes.pillActive : ''} onClick={() => onSizeHandler(el)}>
                    {el.label} <small>~{el.calories.toLocaleString()}</small>
                </button>)}
            </div>
        </li>
        <li>
            <label htmlFor="estimateCalories">Calories</label>
            <input id="estimateCalories" type="number" min="0" step="50" inputMode="numeric" value={calories}
                onChange={e => { setCalories(e.target.value); setSize(null); }} />
            <p className={formClasses.note}>A guess is fine. A slice of large takeout pizza is about 300.</p>
        </li>
        </>}
        <li>
            <label htmlFor="estimateNote">What was it? (optional)</label>
            <input id="estimateNote" type="text" maxLength={60} placeholder="Pizza" value={note} onChange={e => setNote(e.target.value)} />
        </li>
        {type && type !== 'unknown' && macros.calories > 0 && <li>
            <MacroSummary label={date === localDate() ? 'Adds to today' : `Adds to ${formatDay(date)}`}
                detail={knowsMacros ? null : 'estimated'} macros={macros} />
        </li>}
        {date !== localDate() && type === 'unknown' && <li><p className={formClasses.note}>Adds to {formatDay(date)}.</p></li>}
    </Form>
}

export default QuickEstimate;
