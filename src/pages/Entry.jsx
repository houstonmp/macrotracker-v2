import PageContent from "../components/PageContent"
import EntryCard from "../components/Entry/EntryCard/EntryCard"
import classes from "./Entry.module.css"
import MacroList from "../components/Entry/MacroList"

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import FoodDiary from "../components/Entry/FoodDiary"
const DUMMY_ARRAY = {
    recipes: [],
    items: [],
    meals: []
}

// const DUMMY_ARRAY = {
//     recipes: [{
//         id: 'i1',
//         name: 'Eggs',
//         calories: 72,
//         tFat: 13,
//         tProtein: 30,
//         tCarbs: 25,
//         ingredients: ['milk', 'eggs', 'bacon', 'pork', 'chops', 'burritos']
//     }, {
//         id: 'i2',
//         name: 'Eggs',
//         calories: 72,
//         tFat: 13,
//         tProtein: 30,
//         tCarbs: 25,
//         ingredients: ['milk', 'eggs', 'bacon', 'pork', 'chops', 'burritos']
//     }],
//     items: [{
//         id: 'i1',
//         name: 'Eggs',
//         calories: 72,
//         tFat: 13,
//         tProtein: 30,
//         tCarbs: 25,
//         ingredients: ['milk', 'eggs', 'bacon', 'pork', 'chops', 'burritos']
//         // fiber: 
//     },
//     {
//         id: 'i2',
//         name: 'Pancakes',
//         calories: 132,
//         tFat: 5,
//         tProtein: 10,
//         tCarbs: 15,
//         ingredients: ['eggs', 'licorice', 'udon', 'hamburger buns']
//         // fiber: 
//     },
//     {
//         id: 'i3',
//         name: 'Cereal',
//         calories: 150,
//         tFat: 4,
//         tProtein: 50,
//         tCarbs: 65,
//         ingredients: ['frosting', 'tortillas', 'donuts', 'knife shavings', 'potatoes']
//         // fiber: 
//     },
//     {
//         id: 'i4',
//         name: 'Eggs 2',
//         calories: 150,
//         tFat: 4,
//         tProtein: 50,
//         tCarbs: 65,
//         ingredients: ['butter', 'orange juice', 'apples', 'cream', 'Dr Pepper']
//         // fiber: 
//     },
//     {
//         id: 'i5',
//         name: 'Pancakes and Cheese',
//         calories: 150,
//         tFat: 4,
//         tProtein: 50,
//         tCarbs: 65,
//         ingredients: ['vinegar', 'salt', 'potato chip', 'bagel bites']
//         // fiber: 
//     },
//     {
//         id: 'i5',
//         name: 'Pancake Tacos',
//         calories: 150,
//         tFat: 4,
//         tProtein: 50,
//         tCarbs: 65,
//         ingredients: ['yogurt', 'noodles', 'panko', 'water', 'spinach']
//         // fiber: 
//     }],
//     meals: [{
//         id: 'i5',
//         name: 'Spaghetti',
//         calories: 150,
//         tFat: 4,
//         tProtein: 50,
//         tCarbs: 65,
//         ingredients: ['vinegar', 'salt', 'potato chip', 'bagel bites']
//         // fiber: 
//     },
//     {
//         id: 'i5',
//         name: 'Pancake Tacos',
//         calories: 150,
//         tFat: 4,
//         tProtein: 50,
//         tCarbs: 65,
//         ingredients: ['yogurt', 'noodles', 'panko', 'water', 'spinach']
//         // fiber: 
//     }]

// }

const DUMMY_CAL =
{
    date: new Date().getFullYear(),
    calories: 2100,
    tFat: 30,
    tProtein: 20,
    tCarbs: 10,
}


const Entry = (props) => {
    const recipeObj = useSelector(state => state.recipes.recipeObj)


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
            <EntryCard classes={classes.check} onModal={showModalHandler} foodItems={recipeObj} />
            <FoodDiary classes={classes.check} />
            <MacroList />
        </PageContent >
    </>
}

export default Entry;