import { useState } from "react";
import classes from "./EntryCard.module.css"

import Input from "../../UI/Input";
import Button from "../../UI/Button"
import SearchInput from "../../UI/SearchInput";
import RadioInput from "../../UI/RadioInput";
import FilterChoice from './FilterChoice';
import { USDA_api_key } from './api_key';
import formClasses from "../../Form/Form.module.css"
import { uiActions } from "../../store/ui-slice";

const ModifyRecipeData = (props) => {
    const [foodList, setFoodList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const validateInput = (value) => value.trim() !== '';
    console.log("In Modify:", props.formData)

    return <>    <Input id="rName" key="rName" name="recipeName" type="text" label="Food Name:" onPass={props.nameToForm} onValidate={validateInput} isOptional={false} defaultValue={props.formData.name} />
        <div className={classes.ingList}>
            {props.ingList.length > 0 ? props.ingList.map(el =>
                <div id={el.fdcId} key={el.fdcId} onClick={props.onDelete}>
                    <div className={classes.ingItem}>{el.description}</div>
                    <div className={classes.ingExit}>X</div></div>)
                : 'Click an item to add to list'}</div>
        <footer className={formClasses.footer}>
            <Button type='button' onClick={props.onClose}>Cancel</Button>
            <div>
                <Button type='button' onClick={props.onBack}>Back</Button>
                <Button type='button' onClick={props.onContinue} disable={!props.formIsValid}>Continue</Button>
            </div>
        </footer>
    </>
}

export default ModifyRecipeData;