import PageContent from "../components/PageContent"
import Card from '../components/UI/Card'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice"

import WeightEntry from "../components/Weight/WeightEntry";

const Workout = () => {

    const switchWeightUnit = (unit, value) => {
        if (unit === "kgs") {
            wght = document.querySelector("#weight").value;
            wghtArray[index].kgs = wght;
            wghtArray[index].lbs = Number((wght * 2.2).toFixed(2));
        }
        else if (unit === "lbs") {
            wght = document.querySelector("#weight").value;
            wghtArray[index].kgs = Number((wght / 2.2).toFixed(2));
            wghtArray[index].lbs = wght;
        }
    }

    const onAddWeightHandler = () => {

        dispatch(weightActions.updateWeight());
    }


    return <PageContent title="Chart">
        <WeightEntry onAddWeight={onAddWeightHandler} />
        <Card>

        </Card>

    </PageContent>
}

export default Workout;