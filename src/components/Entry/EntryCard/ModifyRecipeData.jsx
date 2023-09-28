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

    return <>
        <article className={formClasses.article}>
            {/* <Input id="rName" key="rName" name="recipeName" type="text" label="Food Name:" onPass={props.nameToForm} onValidate={validateInput} isOptional={false} defaultValue={props.formData.name} /> */}
            <Input id="url" key="url" name="urlInput" type="url" label="Image Url: (Optional)" onPass={props.nameToForm} onValidate={validateInput} isOptional={true} />

            <h3>Modify Ingredients</h3>
            <li>
                <div className={classes.ingridientContainer}>
                    {props.ingList.length > 0 ? props.ingList.map((el, index) =>
                        <>
                            <div>{index + 1}.</div>
                            <i>{` ${el.description}`}</i>
                            <div className={classes.inputIngContainer}>
                                <Input id={"ingWeight" + el.fdcId} key={"ingWeight" + el.fdcId} name="ing-" type="number" onPass={props.nameToForm} onValidate={validateInput} isOptional={true} />


                                <div>
                                    (g)
                                </div>
                            </div>
                        </>

                    )
                        : 'Click an item to add to list'}
                </div>
                <div className={classes.ingBtn}>
                    <Button type='button'>+ Add Ingredient</Button>
                </div>
                <h3>Recipe Instructions: (Optional)</h3>
                <textarea id="recipe-info" name="recipe-info" rows="8">

                </textarea>
            </li>
        </article>
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