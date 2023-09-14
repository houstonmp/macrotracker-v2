import Card from '../UI/Card'
import Button from '../UI/Button';
import classes from './EntryCard.module.css'
import Form from '../Form/Form'
import Table from "../UI/Table";


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
                {props.foodItems.map(item => {
                    return (<tr>
                        <td>
                            {item.name}
                        </td>
                        <td>
                            {item.calories}
                        </td>
                        <td>
                            {item.protein}
                        </td>
                        <td>
                            {item.carbs}
                        </td>
                        <td>
                            {item.tFat}
                        </td>
                    </tr>)
                })}
            </Table>




        </article>
        <footer className={classes.footer}>
            <Button name='recipe' onClick={props.onModal}>+ Add</Button>
            <Button name='item' onClick={props.onModal}>+ Search</Button>
        </footer>
    </Card >
}

export default EntryCard;