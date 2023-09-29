import classes from "./EntryCard.module.css"

import Input from "../../UI/Input";
import Button from "../../UI/Button"
import formClasses from "../../Form/Form.module.css"

import useInput from "../../../hooks/use-input";
import { useEffect } from "react";

const ModifyRecipeData = (props) => {
    const validateInput = (value) => value.trim() !== '';

    const {
        value,
        isValid,
        hasError,
        inputChangeHandler,
        inputBlurHandler,
    } = useInput(() => true, props.formData.instructions);

    useEffect(() => {
        props.instructionsToForm({
            value,
            isValid,
            hasError
        })
    }, [isValid, hasError, value]);

    return <>
        <article className={formClasses.article}>
            <Input id="url" key="url" name="urlInput" type="url" label="Image Url: (Optional)" onPass={props.urlToForm} onValidate={validateInput} isOptional={true} defaultValue={props.formData.img} />

            <h3>Modify Ingredients</h3>
            <li>
                <div key={`ingredients-container`} className={classes.ingridientContainer}>
                    {props.ingList.length > 0 ? props.ingList.map((el, index) =>
                        <>
                            <div key={`num-${index}`}>{index + 1}.</div>
                            <i key={`desc-${index}`} > {` ${el.description}`}</i >
                            <div key={`input-${index}`} className={classes.inputIngContainer}>
                                <Input id={el.fdcId} key={"ingWeight" + el.fdcId + index} name="ing-" type="number" onPass={props.ingredientsToForm} onValidate={validateInput} isOptional={true} defaultValue={el.calculatedData ? el.calculatedData.servingSize : 0} />

                                <div key={`value-${index}`} >
                                    (g)
                                </div>
                            </div >
                        </>

                    )
                        : 'Click an item to add to list'}
                </div>
                <div className={classes.ingBtn}>
                    <Button type='button'>+ Add Ingredient</Button>
                </div>
                <h3>Recipe Instructions: (Optional)</h3>
                <textarea key={`recipe-text`} id="recipe-info" name="recipe-info" rows="8" onBlur={inputBlurHandler} onChange={inputChangeHandler} defaultValue={props.formData.instructions}>
                </textarea>
            </li>
        </article >
        <footer className={formClasses.footer}>
            <Button type='button' onClick={props.onClose}>Cancel</Button>
            <div>
                <Button type='button' onClick={props.onBack}>Back</Button>
                <Button type='button' onClick={props.onContinue}>Continue</Button>
            </div>
        </footer>
    </>
}

export default ModifyRecipeData;