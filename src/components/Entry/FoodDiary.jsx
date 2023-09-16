import { useState } from "react";
import { useSelector } from "react-redux";
import Card from "../UI/Card"
import Table from "../UI/Table";
import classes from "./EntryCard.module.css"

const FoodDiary = () => {
    const [date, setDate] = useState(new Date().toJSON().slice(0, 10));
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

    return <Card>
        <h3>
            Food Diary ({date})
        </h3>
        <Table tableClasses={classes['recipe-table']} header={
            <tr>
                <th>Food</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
            </tr>
        }>
            {foodDiary && foodDiary.food.map((item, index) => {
                const identifier = Math.floor(Math.random * 10000);
                return (<tr key={`${item.name}-${index}`} id={index}>
                    <td key={`name-${item.name}`}>
                        {item.name}
                    </td>
                    <td key={`cal-${item.name}`}>
                        {item.calories}
                    </td>
                    <td key={`protein-${item.name}`}>
                        {item.tProtein}
                    </td>
                    <td key={`carbs-${item.name}`}>
                        {item.tCarbs}
                    </td>
                    <td key={`fat-${item.name}`}>
                        {item.tFat}
                    </td>
                </tr>)
            })}


        </Table>
        {!foodDiary && <p style={{ textAlign: 'center' }}>Add a recipe to get started</p>
        }
    </Card >
}

export default FoodDiary;