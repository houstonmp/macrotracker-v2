import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../UI/Card';
import CardHeader from '../UI/CardHeader';
import SegmentedControl from '../UI/SegmentedControl';
import { GlassIcon } from '../../assets/StatIcons';
import { localDate } from '../../assets/functions';
import { createId } from '../../assets/food';
import { foodDiaryActions } from '../store/food-diary-slice';
import { uiActions } from '../store/ui-slice';
import { selectLatestWeight } from '../store/selectors';
import { CUP_ML, ML_PER_KG, litres, toMl, waterGoal, waterTotal } from './water';
import classes from './WaterCard.module.css';

const UNITS = [{ id: 'oz', label: 'fl oz' }, { id: 'ml', label: 'ml' }];

// A glass that fills to the share of today's goal; past 100% it simply stays full
const WaterGlass = ({ share }) => {
    const level = Math.min(share, 1);
    // The inside of the glass runs from y 10 (rim) to y 112 (base)
    const top = 112 - 102 * level;
    return <svg className={classes.glass} viewBox="0 0 80 120" role="img" aria-label={`${Math.round(share * 100)}% of today's water`}>
        <defs>
            <clipPath id="water-glass">
                <path d="M8 8h64l-7 100a6 6 0 0 1-6 5.6H21a6 6 0 0 1-6-5.6Z" />
            </clipPath>
        </defs>
        <g clipPath="url(#water-glass)">
            <rect className={classes.glassBack} x="0" y="0" width="80" height="120" />
            {level > 0 && <path className={classes.water}
                d={`M0 ${top} q10 -4 20 0 t20 0 t20 0 t20 0 V120 H0Z`} />}
        </g>
        <path className={classes.glassEdge} d="M8 8h64l-7 100a6 6 0 0 1-6 5.6H21a6 6 0 0 1-6-5.6Z" />
    </svg>
}

// Today's water: quick cups for an estimate, or an exact amount from a bottle's label
const WaterCard = (props) => {
    const dispatch = useDispatch();
    const date = localDate();
    const day = useSelector(state => state.fDiary.diaryObj.find(el => el.date === date));
    const latestWeight = useSelector(selectLatestWeight);
    const settings = useSelector(state => state.ui.userPreferences.settings) || {};
    const unit = settings.waterUnit === 'ml' ? 'ml' : 'oz';
    const [amount, setAmount] = useState('');

    const goal = latestWeight && waterGoal(latestWeight.kgs);
    const total = waterTotal(day);
    const share = goal ? total / goal : 0;
    const entries = day && day.water ? day.water : [];
    const cups = entries.filter(el => el.kind === 'cup');
    const exact = entries.filter(el => el.kind !== 'cup');

    const add = (entry) => dispatch(foodDiaryActions.addWater({ date, entry: { id: createId(), ...entry } }));
    const remove = (id) => dispatch(foodDiaryActions.removeWater({ date, id }));

    const onExactHandler = (e) => {
        e.preventDefault();
        const value = Number(amount);
        if (!(value > 0)) {
            return;
        }
        add({ kind: 'exact', ml: toMl(value, unit), label: `${value} ${unit === 'oz' ? 'fl oz' : 'ml'}` });
        setAmount('');
    }

    return <Card classes={props.classes}>
        <CardHeader Icon={GlassIcon} title="Water" subtitle={goal
            ? `Goal ${litres(goal)} · ${ML_PER_KG} ml per kg of your weight`
            : 'Log a weigh-in to get a goal from your weight'} />
        <div className={classes.layout}>
            <WaterGlass share={share} />
            <div className={classes.numbers}>
                {goal && <span className={classes.percent}>{Math.round(share * 100)}%</span>}
                <span>{litres(total)}{goal && ` of ${litres(goal)}`}</span>
                {goal && share >= 1 && <span className={classes.done}>Goal reached today</span>}

                <div className={classes.cups}>
                    <button type="button" aria-label="Remove a cup" disabled={cups.length === 0}
                        onClick={() => remove(cups[cups.length - 1].id)}>−</button>
                    <span className={classes.cupCount}>
                        {cups.length} {cups.length === 1 ? 'cup' : 'cups'}
                        <small>8 fl oz each</small>
                    </span>
                    <button type="button" aria-label="Add a cup" onClick={() => add({ kind: 'cup', ml: CUP_ML })}>+</button>
                </div>
            </div>
        </div>

        <form className={classes.exact} onSubmit={onExactHandler}>
            <label htmlFor="water-amount">Exact amount</label>
            <div className={classes.exactRow}>
                <input id="water-amount" type="number" min="0" step="any" inputMode="decimal" value={amount}
                    placeholder={unit === 'oz' ? '16.9' : '500'} onChange={e => setAmount(e.target.value)} />
                <SegmentedControl label="Water unit" value={unit} options={UNITS}
                    onChange={id => dispatch(uiActions.updateSettings({ waterUnit: id }))} />
                <button type="submit" className={classes.add} disabled={!(Number(amount) > 0)}>Add</button>
            </div>
        </form>

        {exact.length > 0 && <ul className={classes.entries}>
            {exact.map(entry => <li key={entry.id}>
                {entry.label}
                <button type="button" aria-label={`Remove ${entry.label}`} onClick={() => remove(entry.id)}>✕</button>
            </li>)}
        </ul>}
    </Card>
}

export default WaterCard;
