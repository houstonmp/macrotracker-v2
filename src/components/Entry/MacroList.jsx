import classes from "./MacroList.module.css"

import Card from "../UI/Card"
import CardHeader from "../UI/CardHeader";
import StatTile, { StatGrid } from "../UI/StatTile";
import { CalendarCheckIcon } from "../../assets/StatIcons";
import { formatDay, localDate } from "../../assets/functions";
import { useSelector } from "react-redux";
import { selectDailyTargets, selectDiaryDate, selectDiaryDay } from "../store/selectors";
import { splitEstimateCalories, unsplitCalories } from "../../assets/food";

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
    // Follows the diary's day, so paging back shows that day's totals
    const date = useSelector(selectDiaryDate);
    const targets = useSelector(selectDailyTargets);
    const goals = targets && targets.dailyMacros;
    const foodDiary = useSelector(selectDiaryDay);
    const isToday = date === localDate();

    const subtitle = goals ? formatDay(date) : 'Add a weigh-in to see your daily goals';

    // Estimates make the totals less exact; calories with no macros behind them make
    // protein, carbs and fat short, so each tile says how
    const unsplit = unsplitCalories(foodDiary);
    const estimated = unsplit + splitEstimateCalories(foodDiary);
    const noteFor = (stat) => {
        if (stat === 'calories') {
            return estimated > 0 ? `Includes ≈ ${Math.round(estimated).toLocaleString()} kcal estimated` : null;
        }
        if (unsplit > 0) {
            return `Missing macros for ${Math.round(unsplit).toLocaleString()} kcal`;
        }
        return estimated > 0 ? 'Includes estimates' : null;
    }

    return <Card classes={classes.display}>
        <CardHeader Icon={CalendarCheckIcon} title={isToday ? 'Today' : 'Day totals'} subtitle={subtitle} />
        <StatGrid columns={4}>
            {MACROS.map(({ stat, goal }) => {
                const value = foodDiary ? foodDiary.macros[stat] : 0;
                return <StatTile key={stat} stat={stat} value={value}
                    goal={goals && goals[goal]} hint={goals && remaining(value, goals[goal])} note={noteFor(stat)} />
            })}
        </StatGrid>
    </Card>
}

export default MacroList;
