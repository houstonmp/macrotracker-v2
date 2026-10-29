import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Card from "../UI/Card"
import CardHeader from "../UI/CardHeader";
import EntryRow, { EntryList, EmptyState, MacroChips } from "../UI/EntryList";
import { BookIcon } from "../../assets/StatIcons";
import { formatDay, localDate, shiftDate } from "../../assets/functions";
import { foodDiaryActions } from "../store/food-diary-slice";
import { uiActions } from "../store/ui-slice";
import { selectDiaryDate, selectDiaryDay } from "../store/selectors";
import classes from "./FoodDiary.module.css";

// ‹ Tue, Oct 27 › to page through past days; logging and the day's totals follow it
export const DayNav = () => {
    const dispatch = useDispatch();
    const date = useSelector(selectDiaryDate);
    const today = localDate();
    const isToday = date === today;
    // Back to null rather than today's date, so the diary keeps up after midnight
    const go = (next) => dispatch(uiActions.setDiaryDate(next >= today ? null : next));

    return <div className={classes.dayNav}>
        <button type="button" aria-label="Previous day" onClick={() => go(shiftDate(date, -1))}>‹</button>
        <span className={classes.day}>
            {isToday ? 'Today' : formatDay(date)}
            {!isToday && <button type="button" className={classes.backToToday} onClick={() => go(today)}>Back to today</button>}
        </span>
        <button type="button" aria-label="Next day" disabled={isToday} onClick={() => go(shiftDate(date, 1))}>›</button>
    </div>
}

// Macro chips, plus a tag for estimates. Calories-only estimates have no chips to show.
const DiaryExtra = ({ item }) => {
    if (item.estimate && !item.estimateType) {
        return <span className={classes.estimate}>Calories only · no macros</span>;
    }
    return <>
        <MacroChips macros={item.macros} />
        {item.estimate && <span className={classes.estimate}>Estimated macros</span>}
    </>
}

const FoodDiary = (props) => {
    const dispatch = useDispatch();
    const date = useSelector(selectDiaryDate);
    const foodDiary = useSelector(selectDiaryDay);
    const isToday = date === localDate();

    const onDeleteHandler = (id) => {
        dispatch(foodDiaryActions.removeFood({ date, id }));
    }
    const onUntrackedHandler = () => {
        dispatch(foodDiaryActions.setUntracked({ date, untracked: !untracked }));
    }

    const count = foodDiary ? foodDiary.food.length : 0;
    const untracked = Boolean(foodDiary && foodDiary.untracked);

    return <Card classes={props.classes}>
        <CardHeader Icon={BookIcon} title="Food diary" subtitle={`${formatDay(date)} · ${count} ${count === 1 ? 'item' : 'items'}${untracked ? ' · untracked' : ''}`}>
            {props.showLogLink && <Link to="/food">+ Log food</Link>}
        </CardHeader>
        <DayNav />
        {untracked && <p className={classes.untrackedNote}>
            Untracked: this day is left out of your calorie averages.
        </p>}
        {count > 0 ? <EntryList>
            {foodDiary.food.map(item => <EntryRow key={item.id}
                name={item.name}
                detail={item.amount}
                extra={<DiaryExtra item={item} />}
                value={`${item.estimate ? '≈ ' : ''}${Math.round(item.macros.calories)}`} unit="kcal"
                onDelete={() => onDeleteHandler(item.id)} deleteLabel={`Remove ${item.name}`} />)}
        </EntryList> : !untracked && <EmptyState>Nothing logged {isToday ? 'yet today' : 'on this day'}.</EmptyState>}
        <button type="button" className={classes.untrackedToggle} onClick={onUntrackedHandler}>
            {untracked ? 'Count this day again' : 'Mark as untracked'}
        </button>
    </Card>
}

export default FoodDiary;
