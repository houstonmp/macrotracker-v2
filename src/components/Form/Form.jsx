import { useDispatch } from "react-redux";
import Button from "../UI/Button";
import { uiActions } from "../store/ui-slice";

const Form = props => {
    const dispatch = useDispatch();

    const formHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.closeModal());
    }

    return <form onSubmit={formHandler}>
        <ul>
            <li>
                <label htmlFor="i1" />
                <input type="text" required />
            </li>
        </ul>
        <Button type='submit'>Submit</Button>
    </form>

}

export default Form;