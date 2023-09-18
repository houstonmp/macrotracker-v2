import PageContent from "../components/PageContent"
import WorkoutTable from "../components/Workout/WorkoutTable";
import classes from './Workout.module.css';
import Card from "../components/UI/Card";
import classes2 from "../components/Workout/WorkoutTable.module.css"
import ReactPrintButton from '../components/UI/ReactPrintButton';
import { forwardRef, useRef } from "react";

const Workout = () => {

    return <PageContent title="Workout" pageClass={classes.workout}>
        <WorkoutTable className={classes.workoutPage} />
        {/* <ReactPrintButton /> */}
        {/* <Card className={`${classes['side-bar']} ${classes2['cardFlex']}`} /> */}
    </PageContent>
}

export default Workout;