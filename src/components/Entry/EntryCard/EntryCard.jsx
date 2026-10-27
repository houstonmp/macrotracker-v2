import Card from '../../UI/Card'
import Button from '../../UI/Button';
import classes from './EntryCard.module.css'
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import SearchInput from '../../UI/SearchInput';
import MacroData from './MacroData';
import IngredientData from './IngredientData'
import RadioInput from '../../UI/RadioInput';
import formClasses from "../../Form/Form.module.css"
import { recipeListActions } from '../../store/recipe-list-slice';
import { uiActions } from '../../store/ui-slice';
import { ingredientNames } from '../../../assets/food';

const TABS = [
    { id: 'items', title: 'Pantry', hint: 'Foods you keep on hand, from USDA or your own labels.', modal: 'item', createText: '+ Add to Pantry' },
    { id: 'recipes', title: 'Recipes', hint: 'Select or create a new recipe!', modal: 'recipe', createText: '+ Create Recipe' },
    { id: 'meals', title: 'Meals', hint: 'Pantry items and recipes eaten together.', modal: 'meal', createText: '+ Create Meal' },
];

const EntryCard = (props) => {
    const dispatch = useDispatch();
    const [navState, setNavState] = useState('recipes');
    const [filterState, setFilterState] = useState('Macros');
    const [filterValue, setFilterValue] = useState('');
    const tab = TABS.find(el => el.id === navState);

    const search = filterValue.toLowerCase();
    const foodItems = props.foodItems[navState].filter(el => el.name.toLowerCase().includes(search) ||
        ingredientNames(navState, el).some(name => name.toLowerCase().includes(search)));

    const onLogHandler = (entry) => {
        dispatch(uiActions.showModal({
            title: `Log ${entry.name}`,
            message: null,
            componentName: 'log',
            data: { list: navState, entry }
        }));
    }

    const onDeleteHandler = (entry) => {
        dispatch(recipeListActions.removeEntry({ list: navState, id: entry.id }));
    }

    const onNavChangeHandler = (e) => {
        setNavState(e.currentTarget.id)
    }

    const switchRadioFilter = (target) => {
        setFilterState(target.value);
    }

    return <Card classes={classes.recipe} >
        <header className={classes.header}>
            {TABS.map(el => <a key={el.id} id={el.id} className={navState === el.id ? classes.active : ''} onClick={onNavChangeHandler}><h3>{el.title}</h3></a>)}
        </header>
        <article className={classes.article}>
            <i>{tab.hint}</i>

            <div className={formClasses.form}>
                <ul>
                    <SearchInput onSearch={setFilterValue} label={`Filter ${tab.title.toLowerCase()}`} />
                    <RadioInput onChange={switchRadioFilter} radioBtnArray={{ name: 'recipeRadioFilter', value: ['Macros', 'Ingredients'] }} />
                </ul>
            </div>

            {filterState === 'Macros' && 0 < foodItems.length && <MacroData list={navState} tableData={foodItems} onLog={onLogHandler} onDelete={onDeleteHandler} />}
            {filterState === 'Ingredients' && 0 < foodItems.length && <IngredientData list={navState} tableData={foodItems} onLog={onLogHandler} onDelete={onDeleteHandler} />}
            {props.foodItems[navState].length === 0 && <p>Click &apos;{tab.createText.slice(2)}&apos; to get started!</p>}
            {props.foodItems[navState].length > 0 && foodItems.length === 0 && <p>Nothing matches &apos;{filterValue}&apos;</p>}

            <footer className={classes.footer}>
                <Button name={tab.modal} onClick={props.onModal}>{tab.createText}</Button>
            </footer>
        </article>

    </Card >
}

export default EntryCard;
