import PageContent from "../components/PageContent"
import Card from '../components/UI/Card'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice"

import WeightEntry from "../components/Weight/WeightEntry";

const Workout = () => {

    const dispatch = useDispatch();

    const showModalHandler = (e) => {
        dispatch(uiActions.showModal({
            title: 'Entry',
            message: null,
            componentName: e.target.name
        })
        )
    }


    return <PageContent title="Chart">
        <WeightEntry onModal={showModalHandler} />
        <Card>

        </Card>

    </PageContent>
}

export default Workout;