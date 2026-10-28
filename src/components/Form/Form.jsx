import { useDispatch } from "react-redux";
import Button from "../UI/Button";
import { uiActions } from "../store/ui-slice";
import classes from './Form.module.css';

// With overloadFooter the page lays the form out itself (sign in, register). Otherwise
// it's a modal form: stacked fields and a Cancel / submit footer that stays in view.
const Form = props => {
    const dispatch = useDispatch();

    const formHandler = (e) => {
        e.preventDefault();
        if (props.onFormSubmit()) {
            dispatch(uiActions.closeModal());
        }
    }

    const onCloseHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.closeModal());
    }

    if (props.overloadFooter) {
        return <form onSubmit={formHandler} className={classes.form}>
            <ul>
                {props.children}
            </ul>
        </form>
    }

    return <form onSubmit={formHandler} className={classes.dialog}>
        <ul className={classes.fields}>
            {props.children}
        </ul>
        <footer className={classes.footer}>
            <Button type='button' classes={classes.cancel} onClick={onCloseHandler}>Cancel</Button>
            <Button type='submit' classes={classes.submit} disable={!props.formIsValid}>{props.submitText || 'Save'}</Button>
        </footer>
    </form>

}

export default Form;
