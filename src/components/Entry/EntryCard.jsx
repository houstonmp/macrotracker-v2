import Card from '../UI/Card'
import Button from '../UI/Button';
import classes from './EntryCard.module.css'
import Form from '../Form/Form'
import Table from "../UI/Table";
import { useDispatch } from 'react-redux';
import { foodDiaryActions } from '../store/food-diary-slice';


export const RecipeForm = () => {
    const recipeFormHandler = () => {
        return;
    };

    return <Form onFormSubmit={recipeFormHandler}>
        <li>
            <label htmlFor="i1">Recipe Name </label>
            <input type="text" required />
        </li>
        <li>
            <label htmlFor="i2">Protein </label>
            <input type="number" required />
        </li>
        <li>
            <label htmlFor="i2">Carbs </label>
            <input type="number" required />
        </li>
        <li>
            <label htmlFor="i2">Fat </label>
            <input type="number" required />
        </li>
    </Form>
}

const EntryCard = (props) => {
    const dispatch = useDispatch();

    const onClickHandler = (e) => {
        const index = e.currentTarget.id;
        dispatch(foodDiaryActions.updateDiary({
            type: "UPDATE",
            date: new Date().toJSON().slice(0, 10),
            data: props.foodItems[index]
        })
        )
    }

    return <Card classes={classes.recipe} >
        <header className={classes.header}>
            <h3>Recipes</h3>
            <h3>Items</h3>
            <h3>Today's Mealplan</h3>
        </header>
        <article className={classes.article}>
            <Table header={
                <tr>
                    <th>
                        Food Name
                    </th>
                    <th>
                        Total Calories
                    </th>
                    <th>
                        Protein (g)
                    </th>
                    <th>
                        Carbs (g)
                    </th>
                    <th>
                        Fat (g)
                    </th>
                </tr>
            }>
                {props.foodItems.map((item, index) => {
                    const identifier = Math.floor(Math.random * 10000);
                    return (<tr key={`${item.name}-${index}`} id={index} onClick={onClickHandler}>
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




        </article>
        <footer className={classes.footer}>
            <Button name='recipe' onClick={props.onModal}>+ Create Item</Button>
            <Button name='item' onClick={props.onModal}>+ Search</Button>
        </footer>
    </Card >
}

export default EntryCard;