import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Card from "../UI/Card"
import CardHeader from "../UI/CardHeader";
import EntryRow, { EntryList, EmptyState, MacroChips } from "../UI/EntryList";
import { BookIcon } from "../../assets/StatIcons";
import { formatDay, localDate } from "../../assets/functions";
import { foodDiaryActions } from "../store/food-diary-slice";

const FoodDiary = (props) => {
    const dispatch = useDispatch();
    // Worked out each render so the diary moves on to the new day after midnight
    const date = localDate();
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

    const onDeleteHandler = (id) => {
        dispatch(foodDiaryActions.removeFood({ date, id }));
    }

    const count = foodDiary ? foodDiary.food.length : 0;

    return <Card classes={props.classes}>
        <CardHeader Icon={BookIcon} title="Food diary" subtitle={`${formatDay(date)} · ${count} ${count === 1 ? 'item' : 'items'}`}>
            {props.showLogLink && <Link to="/food">+ Log food</Link>}
        </CardHeader>
        {foodDiary ? <EntryList>
            {foodDiary.food.map(item => <EntryRow key={item.id}
                name={item.name}
                detail={item.amount}
                extra={<MacroChips macros={item.macros} />}
                value={Math.round(item.macros.calories)} unit="kcal"
                onDelete={() => onDeleteHandler(item.id)} deleteLabel={`Remove ${item.name}`} />)}
        </EntryList> : <EmptyState>Nothing logged yet today.</EmptyState>}
    </Card>
}

export default FoodDiary;
