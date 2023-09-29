import PageContent from "../components/PageContent"
import WorkoutTable from "../components/Workout/WorkoutTable";
import classes from './Workout.module.css';
const Workout = () => {

    return <PageContent title="Workout" pageClass={classes.workout}>
        <WorkoutTable className={classes.workoutPage} />
    </PageContent>
}

export default Workout;