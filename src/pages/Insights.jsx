import PageContent from "../components/PageContent"
import Card from '../components/UI/Card'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";

import WeightEntry from "../components/Weight/WeightEntry";
import WeightChart from "../components/Weight/WeightChart";

const Insights = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.ui.userPreferences.user)

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
            <ul>
                <li>BMR: {user.BMR && parseFloat(user.BMR.toFixed(2))}</li>
                <li>TDEE: {user.TDEEValue && parseFloat(user.TDEEValue.toFixed(2))}</li>
                <li>Goal Protein:{user.dailyMacros && parseFloat(user.dailyMacros.goalProtein.toFixed(2))}</li>
                <li>Goal Carbs: {user.dailyMacros && parseFloat(user.dailyMacros.goalCarbs.toFixed(2))}</li>
                <li>Goal Fat:{user.dailyMacros && parseFloat(user.dailyMacros.goalFat.toFixed(2))}</li>
            </ul>
        </Card>
    </PageContent>
}

export default Insights;