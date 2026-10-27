import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../UI/Card"
import Table from "../UI/Table";
import DeleteButton from "../UI/DeleteButton";
import { foodDiaryActions } from "../store/food-diary-slice";
import classes from "./EntryCard/EntryCard.module.css"

const FoodDiary = () => {
    const dispatch = useDispatch();
    const [date] = useState(new Date().toJSON().slice(0, 10));
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

    return <Card>
        <h3>
            Food Diary ({date})
        </h3>
        <Table tableClasses={classes['diary-table']} header={
            <tr>
                <th>Food</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
                <th></th>
            </tr>
        }>
            {foodDiary && foodDiary.food.map((item) => {
                return (<tr key={item.id}>
                    <td title={item.amount}>{item.name} <i>({item.amount})</i></td>
                    <td>{Math.round(item.macros.calories)}</td>
                    <td>{item.macros.protein}</td>
                    <td>{item.macros.carbs}</td>
                    <td>{item.macros.fat}</td>
                    <td>
                        <DeleteButton label={`Remove ${item.name}`} onClick={() => onDeleteHandler(item.id)} />
                    </td>
                </tr>)
            })}


        </Table>
        {!foodDiary && <p style={{ textAlign: 'center' }}>Add a recipe to get started</p>
        }
    </Card >
}

export default FoodDiary;