import { useState } from "react";

const FilterChoice = (props) => {
    const [listItem, setList] = useState(props.food);

    const onAddFoodHandler = () => {
        props.onAddItemHandler(listItem);
    }
    const onKeyUpHandler = (e) => {
        e.preventDefault();
        if (e.key === 'Enter') {
            onAddFoodHandler();
        }
    }

    return (<li tabIndex={0} key={listItem.fdcId} onClick={onAddFoodHandler} onKeyUp={onKeyUpHandler}>
        <h4>{listItem.description}</h4>
        <div className="itemData">
            {<div>Brand: {listItem.brandName ? listItem.brandName : 'N/A'}</div>}
            <div></div>
            <div>Barcode: {listItem.gtinUpc ? listItem.gtinUpc : 'N/A'}</div>
        </div>
        <div>
            <i>Serving: {listItem.servingSize ? `${listItem.servingSize}${listItem.servingSizeUnit}` : `1 unit`}</i>
            <i>Protein: {listItem.foodNutrients.protein}</i>
            <i>Carbs: {listItem.foodNutrients.carbs}</i>
            <i>Fat: {listItem.foodNutrients.fat}</i>
            <i>Calories: {listItem.foodNutrients.calories}</i>
        </div>
    </li>)
}

export default FilterChoice;