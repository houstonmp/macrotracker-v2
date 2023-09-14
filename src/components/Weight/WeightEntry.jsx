import Card from "../UI/Card"
import Button from "../UI/Button"
import classes from "./WeightCard.module.css";

const WeightEntry = (props) => {
    return <Card >
        <header className={classes.header}>
            <h3>Weight</h3>
        </header>
        <article className={classes.article}>

        </article>
        <footer className={classes.footer}>
            <Button name='recipe' onClick={props.onModal}>+ Add</Button>
            <Button name='item' onClick={props.onModal}>+ Search</Button>
        </footer>
    </Card>
}

export default WeightEntry;