import classes from "./MacroList.module.css"

import Card from "../UI/Card"
import { useSelector } from "react-redux";
import { useState } from "react";

const MacroList = (props) => {
    const [date, setDate] = useState(new Date().toJSON().slice(0, 10));
    const user = useSelector(state => state.ui.userPreferences.user)
    const foodDiary = useSelector(state => {
        const index = state.fDiary.diaryObj.findIndex(el => {
            return el.date === date;
        })
        if (index > -1) {
            return state.fDiary.diaryObj[index];
        } else {
            return false;
        }
    })
    return <Card classes={classes.display}>
        <div className={classes.macros}>
            <div><h1>{foodDiary ? foodDiary.macros.calories : 0}/{user.dailyMacros && parseInt(user.dailyMacros.goalProtein)}</h1><span>kCal</span></div>
            <div><h1>{foodDiary ? foodDiary.macros.tProtein : 0}/{user.dailyMacros && parseInt(user.dailyMacros.goalProtein)} </h1><span>(g) Protein</span></div>
            <div><h1>{foodDiary ? foodDiary.macros.tCarbs : 0}/{user.dailyMacros && parseInt(user.dailyMacros.goalCarbs)}</h1><span>(g) Carbs</span></div>
            <div><h1>{foodDiary ? foodDiary.macros.tFat : 0}/{user.dailyMacros && parseInt(user.dailyMacros.goalFat)}</h1><span>(g) Fat</span></div>
        </div>
    </Card>
}

export default MacroList;