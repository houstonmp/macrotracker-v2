import PageContent from "../components/PageContent"
import WorkoutTable from "../components/Workout/WorkoutTable";
import ExerciseWeek from "../components/Exercise/ExerciseWeek";
import ExerciseDiary from "../components/Exercise/ExerciseDiary";

// Laid out like Home: cards side by side where there's room, the checklist across the full width
const Workout = () => {
    return <PageContent title="Workout">
        <ExerciseWeek />
        <ExerciseDiary />
        <WorkoutTable />
    </PageContent>
}

export default Workout;
