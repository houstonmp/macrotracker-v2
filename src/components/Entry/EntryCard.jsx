import Card from '../UI/Card'
import Button from '../UI/Button';
import classes from './EntryCard.module.css'
import Form from '../Form/Form'


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
            <ul>
                <li>
                    Roast Beef
                </li>
                <li>
                    Gratin
                </li>
                <li>
                    Spaghetti
                </li>
            </ul>
        </article>
        <footer className={classes.footer}>
            <Button name='recipe' onClick={props.onModal}>+ Add</Button>
            <Button name='item' onClick={props.onModal}>+ Search</Button>
        </footer>

    </Card >
}

export default EntryCard;