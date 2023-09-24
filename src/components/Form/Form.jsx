import { useState } from "react"
import { useDispatch } from "react-redux";
import Button from "../UI/Button";
import { uiActions } from "../store/ui-slice";
import classes from './Form.module.css';

const Form = props => {
    const dispatch = useDispatch();

    // const [formIsValid, setFormIsValid] = useState(false);

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
            <Button type='button' onClick={onCloseHandler}>Close</Button>
            <Button type='submit' disable={!props.formIsValid}>Submit</Button>
        </ul>
    </form>

}

export default Form;