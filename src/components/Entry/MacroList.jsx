import classes from "./MacroList.module.css"

import Card from "../UI/Card"
import CardHeader from "../UI/CardHeader";
import StatTile, { StatGrid } from "../UI/StatTile";
import { CalendarCheckIcon } from "../../assets/StatIcons";
import { formatDay, localDate } from "../../assets/functions";
import { useSelector } from "react-redux";
import { selectDailyTargets } from "../store/selectors";

const MACROS = [
    { stat: 'calories', goal: 'goalCalories' },
    { stat: 'protein', goal: 'goalProtein' },
    { stat: 'carbs', goal: 'goalCarbs' },
    { stat: 'fat', goal: 'goalFat' },
];

const remaining = (value, goal) => {
    const left = Math.round(goal - value);
    return left >= 0 ? `${left} left` : `${-left} over`;
}

const MacroList = () => {
    // Worked out each render so the diary moves on to the new day after midnight
    const date = localDate();
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

    const subtitle = goals ? formatDay(date) : 'Add a weigh-in to see your daily goals';

    return <Card classes={classes.display}>
        <CardHeader Icon={CalendarCheckIcon} title="Today" subtitle={subtitle} />
        <StatGrid columns={4}>
            {MACROS.map(({ stat, goal }) => {
                const value = foodDiary ? foodDiary.macros[stat] : 0;
                return <StatTile key={stat} stat={stat} value={value}
                    goal={goals && goals[goal]} hint={goals && remaining(value, goals[goal])} />
            })}
        </StatGrid>
    </Card>
}

export default MacroList;
