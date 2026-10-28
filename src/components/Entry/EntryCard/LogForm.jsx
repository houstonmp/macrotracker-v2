import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Form from '../../Form/Form'
import AmountInput from './AmountInput';
import { foodDiaryActions } from '../../store/food-diary-slice';
import { localDate } from '../../../assets/functions';
import { amountLabel, createId, defaultAmount, foodAmountMacros, listEntryMacros, scaleMacros } from '../../../assets/food';

// Log Form - adds a pantry food, recipe or meal to today's food diary
const LogForm = (props) => {
    const dispatch = useDispatch();
    const isFood = props.list === 'items';
    const [amount, setAmount] = useState(isFood ? defaultAmount(props.entry) : { quantity: 1 });

    const macros = isFood
        ? foodAmountMacros({ food: props.entry, ...amount })
        : scaleMacros(listEntryMacros(props.list, props.entry), Number(amount.quantity));
    const formIsValid = Number(amount.quantity) > 0;

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        const quantity = Number(amount.quantity);
        dispatch(foodDiaryActions.addFood({
            date: localDate(),
            entry: {
                id: createId(),
                name: props.entry.name,
                amount: isFood ? amountLabel({ ...amount, quantity }) : `${quantity} servings`,
                macros,
            }
        }));
        return true;
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid}>
        <li>
            <label>How much did you have?</label>
            {isFood
                ? <AmountInput food={props.entry} value={amount} onChange={setAmount} />
                : <AmountInput unit="servings" value={amount} onChange={setAmount} />}
        </li>
        <li>{Math.round(macros.calories)} kcal · Protein {macros.protein} g · Carbs {macros.carbs} g · Fat {macros.fat} g</li>
        {isFood && props.entry.missing.length > 0 && <li><i>USDA has no {props.entry.missing.join(', ')} data for this food, so it counts as 0.</i></li>}
    </Form>
}

export default LogForm;
