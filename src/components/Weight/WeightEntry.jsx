import { useState } from "react";

import Card from "../UI/Card"
import CardHeader from "../UI/CardHeader";
import EntryRow, { EntryList, EmptyState } from "../UI/EntryList";
import { ScaleIcon } from "../../assets/StatIcons";
import { formatDay, localDate } from "../../assets/functions";
import Form from '../Form/Form'
import formClasses from '../Form/Form.module.css';
import Input from "../UI/Input";
import { useDispatch, useSelector } from "react-redux";
import { weightActions } from "../store/weight-slice";
import SegmentedControl from "../UI/SegmentedControl";

export const WeightForm = () => {

    const dispatch = useDispatch();
    const validateInput = (value) => value.trim() !== '';
    const validateDateInput = (value) => value && value.trim() !== '';

    const [dateState, setDate] = useState({});
    let formIsValid = false;

    const [weightState, setWeight] = useState({});

    const weightToForm = (inputObj) => setWeight(inputObj);
    const dateToForm = (inputObj) => setDate(inputObj);
    const [radioState, setRadioState] = useState('lbs');

    if (weightState.isValid && dateState.isValid) {
        formIsValid = true;
    }

    const workoutFormHandler = () => {
        if (formIsValid) {
            dispatch(weightActions.updateWeight({
                type: "UPDATE",
                date: dateState.value,
                value: weightState.value,
                unit: radioState
            }));

            dispatch(weightActions.sortDates());
            return true;
        }
        return false;
    };

    return (<Form onFormSubmit={workoutFormHandler} formIsValid={formIsValid} submitText="Save weight">
        <Input id="dateValue" key="DateValue" name="date" type="date" label="Date" onPass={dateToForm} onValidate={validateDateInput} defaultValue={localDate()} />
        <li>
            <ul className={formClasses.group}>
                <Input id="weightValue" key="weightValue" name="weightValue" type="number" label="Weight" placeholder="180" onPass={weightToForm} onValidate={validateInput} />
                <li>
                    <label>Unit</label>
                    <SegmentedControl label="Weight unit" value={radioState} onChange={setRadioState}
                        options={[{ id: 'lbs', label: 'lbs' }, { id: 'kgs', label: 'kg' }]} />
                </li>
            </ul>
        </li>
    </Form>);
}

// "110.6 kg · −1.4 lbs vs Oct 20"
const weightDetail = (entry, previous) => {
    if (!previous) {
        return `${entry.kgs} kg · first weigh-in`;
    }
    const change = Math.round((entry.lbs - previous.lbs) * 10) / 10;
    const sign = change > 0 ? '+' : change < 0 ? '−' : '±';
    return `${entry.kgs} kg · ${sign}${Math.abs(change)} lbs vs ${formatDay(previous.date, { weekday: false })}`;
}

const WeightEntry = (props) => {
    const dispatch = useDispatch();
    const weightObj = useSelector(state => state.weight.weightObj);

    const onDeleteHandler = (date) => {
        dispatch(weightActions.removeWeight({ date }));
    }

    // Stored oldest first; show the newest at the top
    const entries = weightObj.map((entry, index) => ({ entry, previous: weightObj[index - 1] })).reverse();
    const latest = weightObj[weightObj.length - 1];

    return <Card classes={props.classes}>
        <CardHeader Icon={ScaleIcon} title="Weight"
            subtitle={latest ? `Latest ${latest.lbs} lbs on ${formatDay(latest.date)}` : 'Log a weigh-in to get your targets'}>
            <button type="button" name="workout" onClick={props.onModal}>+ Add</button>
        </CardHeader>
        {entries.length > 0 ? <EntryList>
            {entries.map(({ entry, previous }) => <EntryRow key={entry.date}
                name={formatDay(entry.date)}
                detail={weightDetail(entry, previous)}
                value={entry.lbs} unit="lbs"
                onDelete={() => onDeleteHandler(entry.date)} deleteLabel={`Delete weight for ${entry.date}`} />)}
        </EntryList> : <EmptyState>No weigh-ins yet.</EmptyState>}
    </Card>
}

export default WeightEntry;
