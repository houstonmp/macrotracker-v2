import { useState } from "react"
import { useDispatch } from "react-redux";
import Button from "../UI/Button";
import { uiActions } from "../store/ui-slice";
import classes from './Form.module.css';

const Form = props => {
    const dispatch = useDispatch();

    const formHandler = (e) => {
        e.preventDefault();
        props.onFormSubmit();
        if (props.formIsValid) {
            dispatch(uiActions.closeModal());
        }
    }

    const onCloseHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.closeModal());
    }


    return <form onSubmit={formHandler} className={classes.form}>
        <ul>
            {props.children}
            {!props.overloadFooter && <footer className={classes.footer}>
                <Button type='button' onClick={onCloseHandler}>Cancel</Button>
                <Button type='submit' disable={!props.formIsValid}>Submit</Button>
            </footer>}
        </ul>
    </form>

}

export default Form;