import PageContent from "../components/PageContent"
import EntryCard from "../components/Entry/EntryCard/EntryCard"
import classes from "./Entry.module.css"
import MacroList from "../components/Entry/MacroList"

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import FoodDiary from "../components/Entry/FoodDiary"


const MODAL_TITLES = {
    item: 'Add to Pantry',
    recipe: 'New Recipe',
    meal: 'New Meal',
};

const Entry = () => {
    const recipeObj = useSelector(state => state.recipes.recipeObj)
    const dispatch = useDispatch();

    const showModalHandler = (e) => {
        dispatch(uiActions.showModal({
            title: MODAL_TITLES[e.target.name],
            message: null,
            componentName: e.target.name,
            disableExit: true
        })
        )
    }

    return <>
        <PageContent title="Entry">
            <EntryCard classes={classes.check} onModal={showModalHandler} foodItems={recipeObj} />
            <FoodDiary classes={classes.check} />
            <MacroList />
        </PageContent >
    </>
}

export default Entry;