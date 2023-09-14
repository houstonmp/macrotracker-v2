import PageContent from "../components/PageContent"
import Card from "../components/UI/Card"
import EntryCard from "../components/Entry/EntryCard"
import classes from "./Entry.module.css"
import MacroList from "../components/Entry/MacroList"


import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice"
import { useEffect } from "react"
import FoodDiary from "../components/Entry/FoodDiary"

const DUMMY_ARRAY = [
    {
        id: 'i1',
        name: 'Eggs',
        calories: 72,
        tFat: 13,
        protein: 30,
        carbs: 25
        // fiber: 
    },
    {
        id: 'i2',
        name: 'Pancakes',
        calories: 132,
        tFat: 5,
        protein: 10,
        carbs: 15
        // fiber: 
    },
    {
        id: 'i3',
        name: 'Cereal',
        calories: 150,
        tFat: 4,
        protein: 50,
        carbs: 65
        // fiber: 
    },
]

const DUMMY_CAL =
{
    date: new Date().getFullYear(),
    calories: 2100,
    tFat: 30,
    tProtein: 20,
    tCarbs: 10,
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

    useEffect(() => {
        console.log(DUMMY_CAL);
    }, [DUMMY_CAL])


    return <>
        <PageContent title="Entry">
            <EntryCard classes={classes.check} onModal={showModalHandler} foodItems={DUMMY_ARRAY} />
            <FoodDiary />
            <MacroList macroList={DUMMY_CAL} />
        </PageContent >
    </>
}

export default Entry;