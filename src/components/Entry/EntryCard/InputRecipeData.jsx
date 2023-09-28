import { useState } from "react";
import classes from "./EntryCard.module.css"

import Input from "../../UI/Input";
import Button from "../../UI/Button"
import SearchInput from "../../UI/SearchInput";
import RadioInput from "../../UI/RadioInput";
import FilterChoice from './FilterChoice';
import { USDA_api_key } from './api_key';
import formClasses from "../../Form/Form.module.css"


const InputRecipeData = (props) => {
    const [foodList, setFoodList] = useState([]);
    const [radioState, setRadioState] = useState('Foundation');
    const [isLoading, setIsLoading] = useState(false);
    const validateInput = (value) => value.trim() !== '';

    let responseJSON = '';
    const onFilterHandler = async (value) => {
        setIsLoading(true);
        let api_key = USDA_api_key ? USDA_api_key : '';

        if (value) {
            try {
                console.log(value);
                const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${api_key}&query=` + value, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if (!response.ok) {
                    throw new ERROR('Could not connect to Server')
                }
                const data = await response.json();
                responseJSON = data;
                responseJSON = responseJSON.foods.filter(food => {
                    let i = 0;
                    return food.dataType.includes(radioState);
                })
                responseJSON = responseJSON.length > 0 && responseJSON.map(food => {
                    let tempObj = {};
                    for (let i = 0; i < food.foodNutrients.length; i++) {
                        switch (food.foodNutrients[i].nutrientNumber) {
                            case "203":
                                tempObj = { protein: food.foodNutrients[i].value, ...tempObj }
                                break;
                            case "204":
                                tempObj = { fat: food.foodNutrients[i].value, ...tempObj }
                                break;
                            case "205":
                                tempObj = { carbs: food.foodNutrients[i].value, ...tempObj }
                                break;
                            case "208":
                                tempObj = { calories: food.foodNutrients[i].value, ...tempObj }
                                break;
                        }
                    }
                    return {
                        fdcId: food.fdcId,
                        description: food.description,
                        dataType: food.dataType,
                        gtinUpc: food.gtinUpc,
                        brandName: food.brandName,
                        servingSize: food.servingSize,
                        servingSizeUnit: food.servingSizeUnit,
                        foodNutrients: tempObj
                    }
                })
                setFoodList(responseJSON);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.log(error.message)
                return
            }
        }
    }

    const switchRadioFilter = (target) => {
        setRadioState(target.value);
    }

    return <>
        <article className={formClasses.article}>
            <Input id="rName" key="rName" name="recipeName" type="text" label="Food Name:" onPass={props.nameToForm} onValidate={validateInput} isOptional={false} defaultValue={props.formData.name} placeholder="Roast Chicken" />
            <div className={classes.ingList}>
                {props.ingList.length > 0 && props.ingList.map(el =>
                    <div id={el.fdcId} key={el.fdcId} onClick={props.onDelete}>
                        <div className={classes.ingItem}>{el.description}</div>
                        <div className={classes.ingExit}>X</div></div>)
                }</div>
            <RadioInput onChange={switchRadioFilter} radioBtnArray={{ name: 'ingredientRadioFilter', value: ['Foundational', 'Branded', 'Experimental', 'SR Legacy', 'FNDDS'] }} />
            <SearchInput onSearch={onFilterHandler} label="Ingredients" />



            {isLoading ? <div className={classes.circle}></div> :
                <li className={formClasses.serverInfo}>
                    <ul>
                        {foodList.length > 0 && foodList.map(food => {
                            return <FilterChoice key={'USDA_List' + food.fdcId} food={food} onAddItemHandler={props.onAdd} />
                        })}
                        {(props.ingList.length === 0 && foodList.length === 0) ? < div > {'Click an item to add to list'}</div> : <li style={{ textAlign: "center" }}>Result not found...</li>}

                    </ul>
                </li>
            }
        </article >
        <footer className={formClasses.footer}>
            <Button type='button' onClick={props.onClose}>Cancel</Button>
            <Button type='button' onClick={props.onContinue} disable={!props.formIsValid}>Continue</Button>
        </footer>
    </>
}

export default InputRecipeData;