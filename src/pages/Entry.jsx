import PageContent from "../components/PageContent"
import Card from "../components/UI/Card"
import EntryCard from "../components/EntryCard"
import classes from "./Entry.module.css"


import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";

const Entry = (props) => {
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
        </PageContent>
        <div classes={classes.check}>
            <EntryCard onModal={showModalHandler} />
            <Card classes='.checkData'>

            </Card>
        </div>
        <Card classes={classes.calorieTracker}>

        </Card>

    </>
}

export default Entry;