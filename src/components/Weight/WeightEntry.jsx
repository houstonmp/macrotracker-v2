import { useState } from "react";

import Card from "../UI/Card"
import Button from "../UI/Button"
import classes from "./WeightEntry.module.css";
import Table from "../UI/Table"
import Form from '../Form/Form'
import Input from "../UI/Input";
import { useDispatch, useSelector } from "react-redux";
import { weightActions } from "../store/weight-slice";
import RadioInput from "../UI/RadioInput";
import { uiActions } from "../store/ui-slice";
import { BMRImperialMen, TDEE, MacrosByDiceSplit } from "../../assets/functions";

export const WeightForm = () => {


    const dispatch = useDispatch();
    const validateInput = (value) => value.trim() !== '';

    const [dateState, setDate] = useState(new Date().toJSON().slice(0, 10));
    let formIsValid = false;

    const [weightState, setWeight] = useState({});

    const weightToForm = (inputObj) => setWeight(inputObj);
    const dateHandler = (e) => setDate(e.target.value);
    const [radioState, setRadioState] = useState('lbs');
    const user = useSelector(state => state.ui.userPreferences.user)
    const weightObj = useSelector(state => state.weight.weightObj)

    if (weightState.isValid) {
        formIsValid = true;
    }

    const workoutFormHandler = (e) => {
        if (formIsValid) {


            let userData = { ...user };

            dispatch(weightActions.updateWeight({
                type: "UPDATE",
                date: dateState,
                value: weightState.value,
                unit: radioState
            }));

            dispatch(weightActions.sortDates());
            console.log(weightObj[weightObj.length - 1], user.age, user.activityLevel, user.weightDeficit.lbs)
            let BMR = BMRImperialMen(weightObj[weightObj.length - 1].lbs, user.height.in, user.age);
            let TDEEValue = TDEE(user.activityLevel, BMR);
            let dailyMacros = MacrosByDiceSplit(TDEEValue, (user.weightDeficit.lbs * 3500 / 7));

            userData.BMR = BMR;
            userData.TDEEValue = TDEEValue;
            userData.dailyMacros = dailyMacros;

            dispatch(uiActions.replaceUserObjRegister(userData))

            return true;
        }
        return false;
    };

    const switchRadioFilter = (target) => {
        setFilterState(target.value);
    }


    return (<Form onFormSubmit={workoutFormHandler} formIsValid={formIsValid}>
        <li>
            <label htmlFor="date" >Date:</label>
            <input type="date" name="date" onChange={dateHandler} value={dateState} />
        </li>
        <Input id="weightValue" key="weightValue" name="weightValue" type="number" label="Weight:" onPass={weightToForm} onValidate={validateInput} />
        <RadioInput liClass={classes.radio} setFilterState={switchRadioFilter} radioBtnArray={{ name: 'lbsKgs', value: ['lbs', 'kgs'] }} />
    </Form>);
}

const WeightEntry = (props) => {
    // const [date, setDate] = useState(new Date().toJSON().slice(0, 10));
    const weightObj = useSelector(state => state.weight.weightObj);

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
                {weightObj.length > -1 && weightObj.map((item, index) => {
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
            {weightObj.length === 0 && <p style={{ textAlign: 'center' }}>Add an entry to get started</p>}
        </article>
        <footer className={classes.footer}>
            <Button name='workout' onClick={props.onModal}>+ Add</Button>
        </footer>
    </Card>
}

export default WeightEntry;