import { useState } from "react";

import Card from "../UI/Card"
import Button from "../UI/Button"
import classes from "./WeightEntry.module.css";
import Table from "../UI/Table"
import Form from '../Form/Form'
import Input from "../UI/Input";
import { useDispatch, useSelector } from "react-redux";
import { weightActions } from "../store/weight-slice";

export const WorkoutForm = () => {


    const dispatch = useDispatch();
    const validateInput = (value) => value.trim() !== '';
    const [radioState, setRadio] = useState('lbs');
    const [dateState, setDate] = useState(new Date().toJSON().slice(0, 10));
    // const dispatch = useDispatch();
    let formIsValid = false;

    const [weightState, setWeight] = useState({});

    const weightToForm = (inputObj) => setWeight(inputObj);
    const onRadioChangeHandler = (e) => setRadio(e.target.value);
    const dateHandler = (e) => setDate(e.target.value);

    if (weightState.isValid) {
        formIsValid = true;
    }

    const workoutFormHandler = (e) => {
        if (formIsValid) {
            dispatch(weightActions.updateWeight({
                type: "UPDATE",
                date: dateState,
                value: weightState.value,
                unit: radioState
            }));
            console.log("Form Submitted");
            return true;
        }
        return false;
    };
    return (<Form onFormSubmit={workoutFormHandler} formIsValid={formIsValid}>
        <li>
            <label htmlFor="date" >Date:</label>
            <input type="date" name="date" onChange={dateHandler} value={dateState} />
        </li>
        <Input id="weightValue" key="weightValue" name="weightValue" type="number" label="Weight:" onPass={weightToForm} onValidate={validateInput} />
        <li className={classes.radio}>
            <label htmlFor="lbs">lbs:</label>
            <input type="radio" name="lbsKgs" value="lbs" checked={radioState === 'lbs'} onChange={onRadioChangeHandler} />
            <label htmlFor="kgs">kgs:</label>
            <input type="radio" name="lbsKgs" value="kgs" checked={radioState === 'kgs'} onChange={onRadioChangeHandler} />
        </li>
    </Form>);
}

const WeightEntry = (props) => {
    // const [date, setDate] = useState(new Date().toJSON().slice(0, 10));
    const selectedDateObj = useSelector(state => state.weight.weightObj);

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
                {selectedDateObj && selectedDateObj.map((item, index) => {
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