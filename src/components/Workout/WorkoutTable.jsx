import Table from "../UI/Table";
import Card from "../UI/Card";
import CardHeader from "../UI/CardHeader";
import { FlagIcon } from "../../assets/StatIcons";
import classes from './WorkoutTable.module.css'
import ReactToPrint from "react-to-print";
import { useRef } from "react";

const DUMMY_DATA = [
    {
        name: 'Chest Press',
        area: 'Chest',
        wght: 9,
        unit: 'kgs',
        reps: 10,
        sets: 3
    },
    {
        name: 'Chest Fly',
        area: 'Chest',
        wght: 5,
        unit: 'kgs',
        reps: '10~12',
        sets: 3
    },
    {
        name: 'Bench Press',
        area: 'Chest',
        wght: 25,
        unit: 'kgs',
        reps: 10,
        sets: 3
    },
    {
        name: 'Fly Machine',
        area: 'Chest',
        wght: 27.2,
        unit: 'kgs',
        reps: 10,
        sets: 3
    },
    {
        name: 'Dumbbell Press',
        area: 'Chest',
        wght: 7,
        unit: 'kgs',
        reps: 15,
        sets: 3
    },
    {
        name: 'Bench Press',
        area: 'Chest',
        wght: 20,
        unit: 'kgs',
        reps: '15/10(fast)',
        sets: 3
    },
    {
        name: 'Plate Push-up',
        area: 'Chest',
        wght: 8,
        unit: 'kgs',
        reps: '8~10',
        sets: 3
    },
    {
        name: 'Seated Row',
        area: 'Back',
        wght: '27.2',
        unit: 'kgs',
        reps: '12',
        sets: 3
    },
    {
        name: '1 Handed Row',
        area: 'Back',
        wght: '10',
        unit: 'kgs',
        reps: '10',
        sets: 3
    },
    {
        name: 'Lateral Pull Down',
        area: 'Back',
        wght: '31.8',
        unit: 'kgs',
        reps: '12',
        sets: 3
    },
    {
        name: 'Lateral Pull Down (Sm,Mdm,Large)',
        area: 'Back',
        wght: '36.8',
        unit: 'kgs',
        reps: '7',
        sets: 3
    },
    {
        name: 'Bicep Curl',
        area: 'Biceps',
        wght: '7',
        unit: 'kgs',
        reps: '10',
        sets: 3
    },
    {
        name: 'Barbell Curls',
        area: 'Biceps',
        wght: '12',
        unit: 'kgs',
        reps: '10',
        sets: 2
    },
    {
        name: 'Barbell Curls',
        area: 'Biceps',
        wght: '14.5',
        unit: 'kgs',
        reps: '10',
        sets: 2
    },
    {
        name: 'Triceps Pull Down',
        area: 'Triceps',
        wght: '45.4',
        unit: 'kgs',
        reps: '8~10',
        sets: 3
    },
    {
        name: 'Triceps Kickback',
        area: 'Triceps',
        wght: '7',
        unit: 'kgs',
        reps: '8~10',
        sets: 3
    },
    {
        name: 'Bar Squats',
        area: 'Legs',
        wght: '23',
        unit: 'kgs',
        reps: '12',
        sets: 3
    },
    {
        name: 'Bar Squats',
        area: 'Leg',
        wght: '15',
        unit: 'kgs',
        reps: '15',
        sets: 3
    },
    {
        name: 'Bulgarian Squats',
        area: 'Leg',
        wght: '',
        unit: '',
        reps: '10',
        sets: 3
    },
    {
        name: 'Shoulder Press (SM)',
        area: 'Shoulders',
        wght: '15',
        unit: 'kgs',
        reps: '12',
        sets: 3
    },
    {
        name: 'Front Raise',
        area: 'Shoulders',
        wght: '5',
        unit: 'kgs',
        reps: '12',
        sets: 3
    },
    {
        name: 'Side Raise',
        area: 'Shoulders',
        wght: '5',
        unit: 'kgs',
        reps: '10',
        sets: 3
    },
    {
        name: 'Rear Raise',
        area: 'Shoulders',
        wght: '5',
        unit: 'kgs',
        reps: '12',
        sets: 3
    },
    {
        name: 'HIIT Bike',
        area: 'Cardio',
        wght: '40f/20s',
        unit: '(s)',
        reps: '6',
        sets: ''
    },
    {
        name: 'HIIT BIKE',
        area: 'Cardio',
        wght: '20f/10s',
        unit: '(s)',
        reps: '8',
        sets: ''
    },
]

// Same Sunday-first week as the exercise week card
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const WorkoutTable = () => {
    const componentRef = useRef();

    return <Card classes={classes.cardFlex}>
        <CardHeader Icon={FlagIcon} title="Workout checklist" subtitle={`${DUMMY_DATA.length} exercises from your trainer · check off the days you do each`}>
            <ReactToPrint trigger={() => <button type="button">Print</button>} content={() => componentRef.current} />
        </CardHeader>
        <div className={classes.scroll}>
            <Table ref={componentRef} tableClasses={classes['table-classes']} header={
                <tr>
                    <th className={classes.left}>Exercise</th>
                    <th className={classes.left}>Area</th>
                    <th>Weight</th>
                    <th>Reps</th>
                    <th>Sets</th>
                    {DAYS.map(day => <th key={day} className={classes.dayHead}>{day}</th>)}
                </tr>
            }>
                {DUMMY_DATA.map((el, i) => <tr key={`${el.name}-${i}`}>
                    <td className={classes.left}><input aria-label="Exercise" defaultValue={el.name} /></td>
                    <td className={classes.left}><input aria-label="Area" defaultValue={el.area} /></td>
                    <td><input aria-label="Weight" defaultValue={`${el.wght} ${el.unit}`} /></td>
                    <td><input aria-label="Reps" defaultValue={el.reps} /></td>
                    <td><input aria-label="Sets" defaultValue={el.sets} /></td>
                    {DAYS.map(day => <td key={day} className={classes.dayCell}>
                        <input type="checkbox" aria-label={`${el.name} on ${day}`} />
                    </td>)}
                </tr>)}
            </Table>
        </div>
    </Card>
}

export default WorkoutTable;
