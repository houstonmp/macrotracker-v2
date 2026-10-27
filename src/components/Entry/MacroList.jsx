import classes from "./MacroList.module.css"

import Card from "../UI/Card"
import { useSelector } from "react-redux";
import { useState } from "react";
import { selectDailyTargets } from "../store/selectors";

const MacroList = () => {
    const [date] = useState(new Date().toJSON().slice(0, 10));
    const targets = useSelector(selectDailyTargets);
    const goals = targets && targets.dailyMacros;
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
            <div><h1>{foodDiary ? Math.round(foodDiary.macros.calories) : 0}/{goals && goals.goalCalories}</h1><span>kCal</span></div>
            <div><h1>{foodDiary ? Math.round(foodDiary.macros.protein) : 0}/{goals && goals.goalProtein}</h1><span>(g) Protein</span></div>
            <div><h1>{foodDiary ? Math.round(foodDiary.macros.carbs) : 0}/{goals && goals.goalCarbs}</h1><span>(g) Carbs</span></div>
            <div><h1>{foodDiary ? Math.round(foodDiary.macros.fat) : 0}/{goals && goals.goalFat}</h1><span>(g) Fat</span></div>
        </div>
    </Card>
}

export default MacroList;