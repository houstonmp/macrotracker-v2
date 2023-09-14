import PageContent from "../components/PageContent"
import Card from "../components/UI/Card"
import EntryCard from "../components/Entry/EntryCard"
import classes from "./Entry.module.css"


import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice"

const DUMMY_ARRAY = {
    name: 'Eggs',
    calories: 72,
    tFat: 5,
    // protein: 10, 
    // fiber:
}

const Entry = (props) => {
    // useSelector(state => state.weight.)

    const dispatch = useDispatch();

    const showModalHandler = (e) => {
        dispatch(uiActions.showModal({
            title: 'Entry',
            message: null,
            componentName: e.target.name
        })
        )
    }


    return <>
        <PageContent title="Entry">
            <EntryCard classes={classes.check} onModal={showModalHandler} />
            <Card classes={classes.check}>

            </Card>
            <Card classes={classes.check}>

            </Card>
        </PageContent>
    </>
}

export default Entry;