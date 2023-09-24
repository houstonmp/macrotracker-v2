import PageContent from "../components/PageContent"
import Card from "../components/UI/Card"
import EntryCard from "../components/Entry/EntryCard"
import classes from "./Entry.module.css"
import MacroList from "../components/Entry/MacroList"

import { useState } from 'react'
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
        tProtein: 30,
        tCarbs: 25
        // fiber: 
    },
    {
        id: 'i2',
        name: 'Pancakes',
        calories: 132,
        tFat: 5,
        tProtein: 10,
        tCarbs: 15
        // fiber: 
    },
    {
        id: 'i3',
        name: 'Cereal',
        calories: 150,
        tFat: 4,
        tProtein: 50,
        tCarbs: 65
        // fiber: 
    },
    {
        id: 'i4',
        name: 'Eggs 2',
        calories: 150,
        tFat: 4,
        tProtein: 50,
        tCarbs: 65
        // fiber: 
    },
    {
        id: 'i5',
        name: 'PanEggscakes',
        calories: 150,
        tFat: 4,
        tProtein: 50,
        tCarbs: 65
        // fiber: 
    },
    {
        id: 'i5',
        name: 'Paneggscakes',
        calories: 150,
        tFat: 4,
        tProtein: 50,
        tCarbs: 65
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
    const [foodItems, setFoodItems] = useState(DUMMY_ARRAY);

    const dispatch = useDispatch();

    const showModalHandler = (e) => {
        dispatch(uiActions.showModal({
            title: 'Entry',
            message: null,
            componentName: e.target.name
        })
        )
    }


    const onFilterHandler = (value) => {
        const filterValue = value.toLowerCase();

        const newArray = DUMMY_ARRAY.filter((el) => {
            return el.name.toLowerCase().includes(filterValue);
        })

        setFoodItems(newArray);
    }

    return <>
        <PageContent title="Entry">
            <EntryCard classes={classes.check} onModal={showModalHandler} foodItems={foodItems} onFilter={onFilterHandler} />
            <FoodDiary classes={classes.check} />
            <MacroList />
        </PageContent >
    </>
}

export default Entry;