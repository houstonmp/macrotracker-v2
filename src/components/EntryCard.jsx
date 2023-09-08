import Card from '../components/UI/Card'
import Button from './UI/Button';

const EntryCard = (props) => {
    return <Card classes='.recipe' >
        <h3>Recipes</h3>
        <h3>Items</h3>
        <h3>Today's Mealplan</h3>
        <Button name='recipe' onClick={props.onModal}>+ Add</Button>
        <Button name='item' onClick={props.onModal}>+ Search</Button>
    </Card >
}

export default EntryCard;