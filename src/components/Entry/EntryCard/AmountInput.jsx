import inputClasses from '../../UI/Input.module.css'
import classes from './EntryCard.module.css'
import { amountOptions } from '../../../assets/food';

// A quantity plus either a fixed unit ("servings") or a choice of the food's unit and portions
const AmountInput = (props) => {
    const options = props.food ? amountOptions(props.food) : [];
    const selected = props.food && options.findIndex(el => el.label === props.value.portion.label && el.amount === props.value.portion.amount);

    const onQuantityChange = (e) => {
        props.onChange({ ...props.value, quantity: e.target.value });
    }
    const onPortionChange = (e) => {
        props.onChange({ ...props.value, portion: options[e.target.value] });
    }

    return <div className={classes.amount}>
        <input className={`${inputClasses.input} ${classes.quantity}`} type="number" min="0" step="any" aria-label="Quantity" value={props.value.quantity} onChange={onQuantityChange} />
        {props.food
            ? <select aria-label="Unit" value={selected} onChange={onPortionChange}>
                {options.map((el, index) => <option key={`${el.label}-${index}`} value={index}>{el.label}</option>)}
            </select>
            : <span>{props.unit}</span>}
    </div>
}

export default AmountInput;
