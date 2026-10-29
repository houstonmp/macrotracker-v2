import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from '../../Form/Form'
import AmountInput from './AmountInput';
import MacroSummary from '../../Form/MacroSummary';
import SegmentedControl from '../../UI/SegmentedControl';
import formClasses from '../../Form/Form.module.css';
import { foodDiaryActions } from '../../store/food-diary-slice';
import { recipeListActions } from '../../store/recipe-list-slice';
import { formatDay, localDate } from '../../../assets/functions';
import { selectDiaryDate } from '../../store/selectors';
import { amountLabel, createId, defaultAmount, foodAmountMacros, listEntryMacros, recipeGramMacros, recipeRawWeight, recipeWeight, scaleMacros } from '../../../assets/food';

// Log Form - adds a pantry food, recipe or meal to today's food diary.
// Recipes log by grams of the finished dish by default, or by servings.
const LogForm = (props) => {
    const dispatch = useDispatch();
    // The day the diary is showing, so past days can be filled in
    const date = useSelector(selectDiaryDate);
    const isFood = props.list === 'items';
    const recipe = props.list === 'recipes' ? props.entry : null;
    const startWeight = recipe ? recipeWeight(recipe) : 0;

    const [amount, setAmount] = useState(isFood ? defaultAmount(props.entry) : { quantity: 1 });
    const [mode, setMode] = useState(startWeight > 0 ? 'grams' : 'servings');
    // One serving's share of the dish is a sensible first guess at a portion
    const [grams, setGrams] = useState(startWeight > 0 ? String(Math.round(startWeight / (recipe.servings || 1))) : '');
    const [weight, setWeight] = useState(startWeight > 0 ? String(startWeight) : '');
    const [weightChanged, setWeightChanged] = useState(false);

    const byGrams = Boolean(recipe) && mode === 'grams';
    let macros;
    if (isFood) {
        macros = foodAmountMacros({ food: props.entry, ...amount });
    } else if (byGrams) {
        macros = recipeGramMacros(recipe, Number(grams), Number(weight));
    } else {
        macros = scaleMacros(listEntryMacros(props.list, props.entry), Number(amount.quantity));
    }
    const formIsValid = byGrams ? Number(grams) > 0 && Number(weight) > 0 : Number(amount.quantity) > 0;

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        // A weighed dish is remembered for next time; the raw estimate isn't saved
        if (byGrams && weightChanged) {
            dispatch(recipeListActions.updateEntry({ list: 'recipes', id: recipe.id, changes: { cookedWeight: Number(weight) } }));
        }
        const quantity = Number(amount.quantity);
        let label;
        if (byGrams) {
            label = `${Number(grams)} g`;
        } else {
            label = isFood ? amountLabel({ ...amount, quantity }) : `${quantity} servings`;
        }
        dispatch(foodDiaryActions.addFood({
            date,
            entry: {
                id: createId(),
                name: props.entry.name,
                amount: label,
                macros,
            }
        }));
        return true;
    }

    const onWeightChange = (e) => {
        setWeight(e.target.value);
        setWeightChanged(true);
    }

    let weightNote = null;
    if (recipe && !weightChanged) {
        weightNote = recipe.cookedWeight
            ? 'What you weighed it at last time. Change it if this batch came out different.'
            : `Estimated from the raw ingredients${recipeRawWeight(recipe).complete ? '' : ' (some have no weight)'}. Cooking adds or loses water, so weigh the finished dish for an exact number; FitPad remembers it.`;
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid} submitText="Log food">
        {recipe && <li>
            <SegmentedControl label="Log by" value={mode} onChange={setMode}
                options={[{ id: 'grams', label: 'Grams' }, { id: 'servings', label: 'Servings' }]} />
        </li>}
        {byGrams ? <>
            <li>
                <label>How much did you have?</label>
                <AmountInput unit="g" value={{ quantity: grams }} onChange={el => setGrams(el.quantity)} />
            </li>
            <li>
                <label htmlFor="dishWeight">Whole dish weighs (g)</label>
                <input id="dishWeight" type="number" min="0" step="any" value={weight} onChange={onWeightChange} />
                {weightNote && <p className={formClasses.note}>{weightNote}</p>}
            </li>
        </> : <li>
            <label>How much did you have?</label>
            {isFood
                ? <AmountInput food={props.entry} value={amount} onChange={setAmount} />
                : <AmountInput unit="servings" value={amount} onChange={setAmount} />}
        </li>}
        <li><MacroSummary label={date === localDate() ? 'Adds to today' : `Adds to ${formatDay(date)}`} macros={macros} /></li>
        {isFood && props.entry.missing.length > 0 && <li><p className={formClasses.note}>USDA has no {props.entry.missing.join(', ')} data for this food, so it counts as 0.</p></li>}
    </Form>
}

export default LogForm;
