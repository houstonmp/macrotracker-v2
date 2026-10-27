import PageContent from "../components/PageContent"
import Card from '../components/UI/Card'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { selectDailyTargets } from "../components/store/selectors";

import WeightEntry from "../components/Weight/WeightEntry";
import WeightChart from "../components/Weight/WeightChart";

const Insights = () => {
    const dispatch = useDispatch();
    const targets = useSelector(selectDailyTargets);

    const showModalHandler = (e) => {
        dispatch(uiActions.showModal({
            title: 'Entry',
            message: null,
            componentName: e.target.name,
            disableExit: false
        })
        )
    }

    return <PageContent title="Insights">
        <WeightEntry onModal={showModalHandler} />
        <Card>
            <WeightChart />
        </Card>
        <Card>
            {targets ? <ul>
                <li>BMR: {targets.BMR}</li>
                <li>TDEE: {targets.TDEEValue}</li>
                <li>Goal Calories: {targets.dailyMacros.goalCalories}</li>
                <li>Goal Protein: {targets.dailyMacros.goalProtein}</li>
                <li>Goal Carbs: {targets.dailyMacros.goalCarbs}</li>
                <li>Goal Fat: {targets.dailyMacros.goalFat}</li>
            </ul> : <p>Add a weight entry to see your daily targets.</p>}
        </Card>
    </PageContent>
}

export default Insights;