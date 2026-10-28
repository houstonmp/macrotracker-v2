import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classes from './EntryCard.module.css'
import formClasses from '../../Form/Form.module.css'
import Form from '../../Form/Form'
import Input from '../../UI/Input';
import SearchInput from '../../UI/SearchInput';
import DeleteButton from '../../UI/DeleteButton';
import EntryRow, { EntryList, EmptyState } from '../../UI/EntryList';
import MacroSummary from '../../Form/MacroSummary';
import AmountInput from './AmountInput';
import { recipeListActions } from '../../store/recipe-list-slice';
import { createId, defaultAmount, listEntryBasis, listEntryMacros, mealEntryMacros, mealTotalMacros, scaleMacros } from '../../../assets/food';

const validateInput = (value) => value.trim() !== '';
const validateServings = (value) => Number(value) > 0;

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
        ...items.map(food => ({
            type: 'food', key: `food-${food.id}`, name: food.name, food,
            detail: `${food.brand || 'Pantry'} · ${listEntryBasis('items', food)}`, macros: listEntryMacros('items', food),
        })),
        ...(isRecipe ? [] : recipes.map(recipe => ({
            type: 'recipe', key: `recipe-${recipe.id}`, name: recipe.name, recipe,
            detail: 'Recipe · per serving', macros: listEntryMacros('recipes', recipe),
        }))),
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

    const perServing = isRecipe && servings > 1 ? scaleMacros(totals, 1 / servings) : null;
    const sourceText = isRecipe ? 'your pantry' : 'your pantry and recipes';

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid} submitText={isRecipe ? 'Save recipe' : 'Save meal'}>
        <li>
            <ul className={formClasses.group}>
                <Input id="builderName" name="builderName" type="text" label={isRecipe ? 'Recipe name' : 'Meal name'} placeholder={isRecipe ? 'Roast chicken' : 'Breakfast'} onPass={setName} onValidate={validateInput} />
                {isRecipe && <Input id="servings" name="servings" type="number" label="Servings" defaultValue="1" onPass={setServings} onValidate={validateServings} />}
            </ul>
        </li>

        <li className={formClasses.section}>{isRecipe ? 'Ingredients' : 'Foods'}</li>
        <li>
            {entries.length === 0 ? <EmptyState>Nothing added yet. Pick from {sourceText} below.</EmptyState> :
                <ul className={classes.builderList}>
                    {entries.map(el => {
                        const name = el.type === 'recipe' ? el.recipe.name : el.food.name;
                        return <li key={el.key} className={classes.builderRow}>
                            <div className={classes.builderTop}>
                                <span className={classes.builderName}>{name}</span>
                                <span className={classes.builderCalories}>{Math.round(mealEntryMacros(el).calories)} kcal</span>
                                <DeleteButton label={`Remove ${name}`} onClick={() => onRemoveHandler(el.key)} />
                            </div>
                            {el.type === 'recipe'
                                ? <AmountInput unit="servings" value={el} onChange={amount => onAmountChange(el.key, amount)} />
                                : <AmountInput food={el.food} value={el} onChange={amount => onAmountChange(el.key, amount)} />}
                        </li>
                    })}
                </ul>}
        </li>
        {entries.length > 0 && <li>
            <MacroSummary label="Total" detail={perServing && `${Math.round(perServing.calories)} kcal per serving`} macros={totals} />
        </li>}

        <li className={formClasses.section}>Add from {sourceText}</li>
        <SearchInput onSearch={setSearch} label={`Search ${sourceText}`} />
        <li>
            {items.length === 0 ? <EmptyState>Your pantry is empty. Add foods from the Pantry tab first.</EmptyState> :
                choices.length === 0 ? <EmptyState>No matches for &ldquo;{search}&rdquo;.</EmptyState> :
                    <EntryList>
                        {choices.map(choice => <EntryRow key={choice.key} name={choice.name} detail={choice.detail}
                            value={Math.round(choice.macros.calories)} unit="kcal" onClick={() => onAddHandler(choice)} />)}
                    </EntryList>}
        </li>

        {isRecipe && <>
            <li className={formClasses.section}>Details</li>
            <Input id="url" name="urlInput" type="url" label="Image URL" note="Optional" onPass={setImg} onValidate={validateInput} isOptional={true} />
            <li>
                <label htmlFor="recipe-info">Instructions<span className={formClasses.note}> · Optional</span></label>
                <textarea id="recipe-info" name="recipe-info" rows="6" value={instructions} onChange={onInstructionsChange}></textarea>
            </li>
        </>}
    </Form>
}

export default BuilderForm;
