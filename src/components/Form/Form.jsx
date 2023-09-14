import { useDispatch } from "react-redux";
import Button from "../UI/Button";
import { uiActions } from "../store/ui-slice";
import classes from './Form.module.css'

const Form = props => {
    const dispatch = useDispatch();

    const formHandler = (e) => {
        e.preventDefault();
        console.log(e.target);
        props.onFormSubmit();
        dispatch(uiActions.closeModal());
    }

    const onCancelHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.closeModal());
    }

    return <form onSubmit={formHandler} className={classes.form}>
        <ul>
            {props.children}
            <Button onClick={onCancelHandler}>Cancel</Button>
            <Button type='submit'>Submit</Button>
        </ul>

    </form>

}

export default Form;