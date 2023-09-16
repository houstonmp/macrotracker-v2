import { useState } from "react";

import Card from "../UI/Card"
import Button from "../UI/Button"
import classes from "./WeightEntry.module.css";
import Table from "../UI/Table"
import Form from '../Form/Form'
import Input from "../UI/Input";

export const WorkoutForm = () => {
    const validateInput = (value) => value.trim() !== '';
    const [radioState, setRadio] = useState('lbs');
    // const dispatch = useDispatch();
    let formIsValid = false;

    const [weightState, setWeight] = useState({});

    const weightToForm = (inputObj) => setWeight(inputObj);
    const onRadioChangeHandler = (e) => setRadio(e.target.value);

    if (weightState.isValid) {
        formIsValid = true;
    }

    const workoutFormHandler = () => {
        if (formIsValid) {
            console.log("Form Submitted");
            return true;
        }
        return false;
    };


    return (<Form onFormSubmit={workoutFormHandler} formIsValid={formIsValid}>
        <Input id="weightValue" key="weightValue" name="weightValue" type="number" label="Weight:" onPass={weightToForm} onValidate={validateInput}>

        </Input>
        <li className={classes.radio}>
            <label htmlFor="lbs">lbs:</label>
            <input type="radio" name="lbsKgs" value="lbs" checked={radioState === 'lbs'} onChange={onRadioChangeHandler} />
            <label htmlFor="kgs">kgs:</label>
            <input type="radio" name="lbsKgs" value="kgs" checked={radioState === 'kgs'} onChange={onRadioChangeHandler} />
        </li>
    </Form>);
}

const WeightEntry = (props) => {
    return <Card >
        <header className={classes.header}>
            <h3>Weight</h3>
        </header>
        <article className={classes.article}>
            <Table tableClasses={classes['workout-table']} header={
                <tr>
                    <th>
                        Date
                    </th>
                    <th>
                        lbs
                    </th>
                    <th>
                        kgs
                    </th>
                </tr>
            }>
                {props.weightObj.map((item, index) => {
                    return (<tr key={`${item.date}-${index}`} id={index}>
                        <td key={`date-${item.date}`}>
                            {item.date}
                        </td>
                        <td key={`lbs-${item.date}`}>
                            {item.lbs}
                        </td>
                        <td key={`kgs-${item.date}`}>
                            {item.kgs}
                        </td>
                    </tr>)
                })}
            </Table>
        </article>
        <footer className={classes.footer}>
            <Button name='workout' onClick={props.onModal}>+ Add</Button>
        </footer>
    </Card>
}

export default WeightEntry;