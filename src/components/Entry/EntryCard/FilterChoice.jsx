import classes from './EntryCard.module.css'
import { nutrientBasis } from '../../../assets/food';

const FilterChoice = (props) => {
    const food = props.food;

    const onSelectHandler = () => {
        props.onSelect(food);
    }
    const onKeyUpHandler = (e) => {
        e.preventDefault();
        if (e.key === 'Enter') {
            onSelectHandler();
        }
    }

    return (<li tabIndex={0} className={props.selected ? classes.selected : ''} onClick={onSelectHandler} onKeyUp={onKeyUpHandler}>
        <h4>{food.name}</h4>
        <div className="itemData">
            <div>Brand: {food.brand || 'N/A'}</div>
            <div>{food.dataType}</div>
        </div>
        <div>
            <i>{nutrientBasis(food)}:</i>
            <i>Calories: {food.nutrients.calories}</i>
            <i>Protein: {food.nutrients.protein}</i>
            <i>Carbs: {food.nutrients.carbs}</i>
            <i>Fat: {food.nutrients.fat}</i>
            {food.missing.length > 0 && <i>No data: {food.missing.join(', ')}</i>}
        </div>
    </li>)
}

export default FilterChoice;
