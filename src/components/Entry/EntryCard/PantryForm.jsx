import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import classes from './EntryCard.module.css'
import formClasses from '../../Form/Form.module.css'
import Form from '../../Form/Form'
import Input from '../../UI/Input';
import RadioInput from '../../UI/RadioInput';
import SearchInput from '../../UI/SearchInput';
import FilterChoice from './FilterChoice';
import { recipeListActions } from '../../store/recipe-list-slice';
import { UNITS, customFood, namedPortion } from '../../../assets/food';
import { DATA_TYPES, fetchUsdaPortions, searchUsda } from '../../../assets/usda';

const validateInput = (value) => value.trim() !== '';
const validateAmount = (value) => value.trim() !== '' && Number(value) >= 0;
const validatePositive = (value) => Number(value) > 0;

const UNIT_LABELS = { g: 'grams (g)', ml: 'millilitres (ml)', serving: 'no weight on label (e.g. 1 bottle)' };

// Pick a USDA food once and save it to the pantry under your own name
const UsdaFoodForm = () => {
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const [dataType, setDataType] = useState('Generic');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('idle');
    const [selected, setSelected] = useState(null);
    const [nameState, setName] = useState({});
    const [portionNameState, setPortionName] = useState({});
    const [portionAmountState, setPortionAmount] = useState({});

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        let cancelled = false;
        setStatus('loading');
        searchUsda(query, dataType)
            .then(foods => {
                if (!cancelled) {
                    setResults(foods);
                    setStatus('idle');
                }
            })
            .catch(() => !cancelled && setStatus('error'));
        return () => {
            cancelled = true;
        }
    }, [query, dataType]);

    const onSelectHandler = (food) => {
        setSelected(food);
        if (food.dataType === 'Branded') {
            return;
        }
        // Portions are a convenience; if this fails the food can still be logged in grams
        fetchUsdaPortions(food.fdcId)
            .then(portions => setSelected(prev => (prev && prev.fdcId === food.fdcId ? { ...prev, portions: [...prev.portions, ...portions] } : prev)))
            .catch(() => { });
    }

    // Your own portion is optional, but if either half is filled in, both must be
    const hasOwnPortion = Boolean(portionNameState.value) || Boolean(portionAmountState.value);
    const ownPortionIsValid = !hasOwnPortion || Boolean(portionNameState.isValid && portionAmountState.isValid);
    const formIsValid = Boolean(selected) && Boolean(nameState.isValid) && ownPortionIsValid;

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        // Your own portion goes first so it becomes the default when logging
        const portions = hasOwnPortion
            ? [namedPortion(portionNameState.value.trim(), Number(portionAmountState.value), selected.unit), ...selected.portions]
            : selected.portions;
        dispatch(recipeListActions.addEntry({ list: 'items', data: { ...selected, name: nameState.value.trim(), portions } }));
        return true;
    }

    const switchDataType = (target) => {
        setDataType(target.value);
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid}>
        <RadioInput onChange={switchDataType} radioBtnArray={{ name: 'usdaDataType', value: Object.keys(DATA_TYPES) }} />
        <SearchInput onSearch={setQuery} label="Search USDA foods (e.g. egg)" />
        {selected && <Input key={selected.fdcId} id="pantryName" name="pantryName" type="text" label="Save to your pantry as:" defaultValue={selected.name} onPass={setName} onValidate={validateInput} />}
        {selected && <li><i>{selected.portions.length > 0 ? `Portions: ${selected.portions.map(el => el.label).join(', ')}` : `Logged in ${selected.unit}`}</i></li>}
        {selected && <Input key={`${selected.fdcId}-portion`} id="portionName" name="portionName" type="text" label="Your own portion: (Optional)" placeholder="1 bottle" onPass={setPortionName} onValidate={validateInput} isOptional={!portionAmountState.value} />}
        {selected && <Input key={`${selected.fdcId}-amount`} id="portionAmount" name="portionAmount" type="number" label={`How many ${selected.unit} is that?`} placeholder="(500)" onPass={setPortionAmount} onValidate={validatePositive} isOptional={!portionNameState.value} />}
        <article className={formClasses.article}>
            {status === 'loading' ? <div className={classes.circle}></div> :
                <li className={formClasses.serverInfo}>
                    <ul>
                        {status === 'error' && <li>Could not reach USDA. Try again in a moment.</li>}
                        {status === 'idle' && query && results.length === 0 && <li>No results found...</li>}
                        {results.map(food => <FilterChoice key={food.fdcId} food={food} selected={selected && selected.fdcId === food.fdcId} onSelect={onSelectHandler} />)}
                    </ul>
                </li>
            }
        </article>
    </Form>
}

// A food typed in from its nutrition label
const CustomFoodForm = () => {
    const dispatch = useDispatch();
    const [nameState, setName] = useState({});
    const [servingLabelState, setServingLabel] = useState({});
    const [unit, setUnit] = useState('g');
    const [servingAmountState, setServingAmount] = useState({});
    const [caloriesState, setCalories] = useState({});
    const [proteinState, setProtein] = useState({});
    const [carbsState, setCarbs] = useState({});
    const [fatState, setFat] = useState({});
    const [ingState, setIngredients] = useState({});

    const formIsValid = Boolean(nameState.isValid && (unit === 'serving' || servingAmountState.isValid) && proteinState.isValid && carbsState.isValid && fatState.isValid &&
        (!caloriesState.value || caloriesState.isValid));

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        const protein = Number(proteinState.value);
        const carbs = Number(carbsState.value);
        const fat = Number(fatState.value);
        dispatch(recipeListActions.addEntry({
            list: 'items',
            data: customFood({
                name: nameState.value.trim(),
                servingLabel: servingLabelState.value && servingLabelState.value.trim(),
                unit,
                servingAmount: Number(servingAmountState.value),
                // Label calories win; otherwise estimate from the macros
                calories: caloriesState.value ? Number(caloriesState.value) : (protein * 4) + (carbs * 4) + (fat * 9),
                protein,
                carbs,
                fat,
                ingredients: ingState.value ? ingState.value.split(',').map(el => el.trim()).filter(Boolean) : [],
            })
        }));
        return true;
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid}>
        <Input id="cName" name="customName" type="text" label="Food Name:" onPass={setName} onValidate={validateInput} placeholder="Protein Bar" />
        <Input id="cServing" name="customServing" type="text" label="Serving name: (Optional)" onPass={setServingLabel} onValidate={validateInput} isOptional={true} placeholder="1 bottle" />
        <li>
            <label htmlFor="cUnit">Serving measured in:</label>
            <select id="cUnit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNITS.map(el => <option key={el} value={el}>{UNIT_LABELS[el]}</option>)}
            </select>
        </li>
        {unit !== 'serving' && <Input id="cAmount" name="customAmount" type="number" label={`Serving size (${unit}):`} onPass={setServingAmount} onValidate={validatePositive} placeholder="(500)" />}
        <Input id="cCalories" name="customCalories" type="number" label="Calories per serving: (Optional)" onPass={setCalories} onValidate={validateAmount} isOptional={true} placeholder="Worked out from macros if blank" />
        <Input id="cProtein" name="customProtein" type="number" label="Protein per serving (g):" onPass={setProtein} onValidate={validateAmount} placeholder="(6)" />
        <Input id="cCarbs" name="customCarbs" type="number" label="Carbs per serving (g):" onPass={setCarbs} onValidate={validateAmount} placeholder="(15)" />
        <Input id="cFat" name="customFat" type="number" label="Fat per serving (g):" onPass={setFat} onValidate={validateAmount} placeholder="(16)" />
        <Input id="cIngredients" name="customIngredients" type="text" label="Ingredients List: (Optional)" onPass={setIngredients} onValidate={validateInput} isOptional={true} placeholder="Almonds, Chicory root fiber, honey..." />
    </Form>
}

//Pantry Form - Passed to Modal as a Component
const PantryForm = () => {
    const [source, setSource] = useState('USDA');

    const switchSource = (target) => {
        setSource(target.value);
    }

    return <>
        <div className={formClasses.form}>
            <ul>
                <RadioInput onChange={switchSource} radioBtnArray={{ name: 'pantrySource', value: ['USDA', 'Custom'] }} />
            </ul>
        </div>
        {source === 'USDA' ? <UsdaFoodForm /> : <CustomFoodForm />}
    </>
}

export default PantryForm;
