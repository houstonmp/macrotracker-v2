import PageContent from "../components/PageContent"
import Card from '../components/UI/Card'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice"

import WeightEntry from "../components/Weight/WeightEntry";

const DUMMY_ARRAY = [
    {
        date: new Date('2023-09-14').toJSON().slice(0, 10),
        lbs: 150,
        kgs: 68.18
    },
    {
        date: new Date('2023-09-15').toJSON().slice(0, 10),
        lbs: 200,
        kgs: 90.91
    },
    {
        date: new Date('2023-09-15').toJSON().slice(0, 10),
        lbs: 170,
        kgs: 77.27
    }
]

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

    // const onAddWeightHandler = () => {

    //     dispatch(weightActions.updateWeight());
    // }

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
        <WeightEntry onModal={showModalHandler} weightObj={DUMMY_ARRAY} />
        <Card>

        </Card>

    </PageContent>
}

export default Workout;