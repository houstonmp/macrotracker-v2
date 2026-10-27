import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classes from './EntryCard.module.css'
import formClasses from '../../Form/Form.module.css'
import Form from '../../Form/Form'
import Input from '../../UI/Input';
import SearchInput from '../../UI/SearchInput';
import DeleteButton from '../../UI/DeleteButton';
import AmountInput from './AmountInput';
import { recipeListActions } from '../../store/recipe-list-slice';
import { createId, defaultAmount, mealEntryMacros, mealTotalMacros, scaleMacros } from '../../../assets/food';

const validateInput = (value) => value.trim() !== '';
const validateServings = (value) => Number(value) > 0;

const macroSummary = (macros) => `${Math.round(macros.calories)} kcal · P ${macros.protein} g · C ${macros.carbs} g · F ${macros.fat} g`;

// Recipes are built from pantry foods; meals from pantry foods and recipes.
// Recipe & Meal Form - Passed to Modal as a Component
const BuilderForm = (props) => {
    const isRecipe = props.kind === 'recipe';
    const dispatch = useDispatch();
    const { items, recipes } = useSelector(state => state.recipes.recipeObj);
    const [nameState, setName] = useState({});
    const [servingsState, setServings] = useState({});
    const [imgState, setImg] = useState({});
    const [instructions, setInstructions] = useState('');
    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState([]);

    const choices = [
        ...items.map(food => ({ type: 'food', key: `food-${food.id}`, name: food.name, detail: food.brand || 'Pantry', food })),
        ...(isRecipe ? [] : recipes.map(recipe => ({ type: 'recipe', key: `recipe-${recipe.id}`, name: recipe.name, detail: 'Recipe', recipe }))),
    ].filter(choice => choice.name.toLowerCase().includes(search.toLowerCase()));

    const onAddHandler = (choice) => {
        const entry = choice.type === 'recipe'
            ? { type: 'recipe', recipe: choice.recipe, quantity: 1 }
            : { type: 'food', food: choice.food, ...defaultAmount(choice.food) };
        setEntries(prev => [...prev, { ...entry, key: createId() }]);
    }

    const onAmountChange = (key, amount) => {
        setEntries(prev => prev.map(el => (el.key === key ? { ...el, quantity: amount.quantity, portion: amount.portion } : el)));
    }

    const onRemoveHandler = (key) => {
        setEntries(prev => prev.filter(el => el.key !== key));
    }

    const servings = isRecipe ? Number(servingsState.value) : 1;
    const totals = mealTotalMacros({ entries });
    const formIsValid = Boolean(nameState.isValid) && entries.length > 0 && entries.every(el => Number(el.quantity) > 0) &&
        (!isRecipe || Boolean(servingsState.isValid));

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        const name = nameState.value.trim();
        const data = isRecipe ? {
            id: createId(),
            name,
            servings,
            instructions: instructions.trim(),
            img: (imgState.value || '').trim(),
            ingredients: entries.map(el => ({ food: el.food, quantity: Number(el.quantity), portion: el.portion })),
        } : {
            id: createId(),
            name,
            entries: entries.map(el => (el.type === 'recipe'
                ? { type: 'recipe', recipe: el.recipe, quantity: Number(el.quantity) }
                : { type: 'food', food: el.food, quantity: Number(el.quantity), portion: el.portion })),
        };
        dispatch(recipeListActions.addEntry({ list: isRecipe ? 'recipes' : 'meals', data }));
        return true;
    }

    const onInstructionsChange = (e) => {
        setInstructions(e.target.value);
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid}>
        <Input id="builderName" name="builderName" type="text" label={isRecipe ? 'Recipe Name:' : 'Meal Name:'} placeholder={isRecipe ? 'Roast Chicken' : 'Breakfast'} onPass={setName} onValidate={validateInput} />
        {isRecipe && <Input id="servings" name="servings" type="number" label="Servings:" defaultValue="1" onPass={setServings} onValidate={validateServings} />}

        <li><h3>{isRecipe ? 'Ingredients' : 'Foods'}</h3></li>
        {entries.length === 0 && <li><i>Pick from your pantry{isRecipe ? '' : ' or recipes'} below.</i></li>}
        {entries.map(el => <li key={el.key} className={classes.builderRow}>
            <span className={classes.builderName}>{el.type === 'recipe' ? el.recipe.name : el.food.name}</span>
            {el.type === 'recipe'
                ? <AmountInput unit="servings" value={el} onChange={amount => onAmountChange(el.key, amount)} />
                : <AmountInput food={el.food} value={el} onChange={amount => onAmountChange(el.key, amount)} />}
            <span>{Math.round(mealEntryMacros(el).calories)} kcal</span>
            <DeleteButton label={`Remove ${el.type === 'recipe' ? el.recipe.name : el.food.name}`} onClick={() => onRemoveHandler(el.key)} />
        </li>)}
        {entries.length > 0 && <li>
            <b>Total: {macroSummary(totals)}</b>
            {isRecipe && servings > 1 && <i>Per serving: {macroSummary(scaleMacros(totals, 1 / servings))}</i>}
        </li>}

        <SearchInput onSearch={setSearch} label={isRecipe ? 'Search your pantry' : 'Search your pantry and recipes'} />
        <article className={formClasses.article}>
            <li className={formClasses.serverInfo}>
                <ul>
                    {items.length === 0 && <li>Your pantry is empty. Add foods from the Pantry tab first.</li>}
                    {choices.map(choice => <li key={choice.key} tabIndex={0} onClick={() => onAddHandler(choice)} onKeyUp={(e) => e.key === 'Enter' && onAddHandler(choice)}>
                        <h4>{choice.name}</h4>
                        <div><i>{choice.detail}</i></div>
                    </li>)}
                </ul>
            </li>
        </article>

        {isRecipe && <>
            <Input id="url" name="urlInput" type="url" label="Image Url: (Optional)" onPass={setImg} onValidate={validateInput} isOptional={true} />
            <li>
                <label htmlFor="recipe-info">Recipe Instructions: (Optional)</label>
                <textarea id="recipe-info" name="recipe-info" rows="6" value={instructions} onChange={onInstructionsChange}></textarea>
            </li>
        </>}
    </Form>
}

export default BuilderForm;
