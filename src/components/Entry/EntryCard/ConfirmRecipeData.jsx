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

const ConfirmRecipeData = (props) => {
    const validateInput = (value) => value.trim() !== '';

    return <>
        <article className={formClasses.article}>
            <h2>{props.formData.name}</h2>

            {props.formData.img && <img className={classes.img} src={props.formData.img} alt="" />}

            <h3>Ingredients</h3>
            <li>
                <div className={classes.ingridientContainer}>
                    {props.ingList.length > 0 && props.ingList.map((el, index) =>
                        <>
                            <div>{index + 1}.</div>
                            <i>{` ${el.description}`} {Math.floor(Math.random() * 100)}(g)</i>
                            <div className={classes.inputIngContainer}>

                                <div>
                                    <p>

                                    </p>
                                    <div>
                                        Protein: {Math.floor(Math.random() * 100)}(g)
                                    </div>
                                    <div>
                                        Carbs: {Math.floor(Math.random() * 100)}(g)
                                    </div>
                                    <div>
                                        Fat: {Math.floor(Math.random() * 100)}(g)
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {props.formData.instructions && (
                    <>
                        <h3>Instructions:</h3>
                        <ol className={classes.instructText}>
                            {props.formData.instructions.replace(/[\r\n]{2,}/g, "\n").split('\n').map((el, index) => {
                                return <li className={classes.instructBullet} key={`instructions-${index}`}>{index + 1}. {el}</li>
                            })}
                        </ol>
                    </>)}
            </li>
        </article>
        <footer className={formClasses.footer}>
            <Button type='button' onClick={props.onClose}>Cancel</Button>
            <div>
                <Button type='button' onClick={props.onBack}>Back</Button>
                <Button type='button' onClick={props.onSubmit}>Submit</Button>
            </div>
        </footer>
    </>
}

export default ConfirmRecipeData;