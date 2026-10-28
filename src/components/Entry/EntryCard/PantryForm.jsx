import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import classes from './EntryCard.module.css'
import formClasses from '../../Form/Form.module.css'
import Form from '../../Form/Form'
import Input from '../../UI/Input';
import SegmentedControl from '../../UI/SegmentedControl';
import { EntryList, EmptyState } from '../../UI/EntryList';
import SearchInput from '../../UI/SearchInput';
import FilterChoice from './FilterChoice';
import { recipeListActions } from '../../store/recipe-list-slice';
import { UNITS, customFood, namedPortion } from '../../../assets/food';
import { DATA_TYPES, fetchUsdaPortions, searchUsda } from '../../../assets/usda';

const validateInput = (value) => value.trim() !== '';
const validateAmount = (value) => value.trim() !== '' && Number(value) >= 0;
const validatePositive = (value) => Number(value) > 0;

const UNIT_LABELS = { g: 'Grams (g)', ml: 'Millilitres (ml)', serving: 'Servings only' };

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

    const onClearHandler = () => {
        setSelected(null);
        setName({});
        setPortionName({});
        setPortionAmount({});
    }

    let resultList = null;
    if (status === 'loading') {
        resultList = <div className={classes.circle}></div>;
    } else if (status === 'error') {
        resultList = <EmptyState>Couldn&apos;t reach USDA. Try again in a moment.</EmptyState>;
    } else if (!query) {
        resultList = <p className={formClasses.note}>Generic is USDA&apos;s lab-tested whole foods (eggs, rice, chicken). Branded is packaged food by name or brand.</p>;
    } else if (results.length === 0) {
        resultList = <EmptyState>No results for &ldquo;{query}&rdquo;.</EmptyState>;
    } else {
        resultList = <EntryList>
            {results.map(food => <FilterChoice key={food.fdcId} food={food} onSelect={onSelectHandler} />)}
        </EntryList>;
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid} submitText="Add to pantry">
        {!selected && <>
            <li>
                <SegmentedControl label="USDA data" value={dataType} onChange={setDataType}
                    options={Object.keys(DATA_TYPES).map(id => ({ id, label: id }))} />
            </li>
            <SearchInput onSearch={setQuery} defaultValue={query} label="Search USDA foods, e.g. egg" />
            <li>{resultList}</li>
        </>}
        {selected && <>
            <li>
                <EntryList><FilterChoice food={selected} onDelete={onClearHandler} /></EntryList>
            </li>
            <Input key={selected.fdcId} id="pantryName" name="pantryName" type="text" label="Save to your pantry as" defaultValue={selected.name} onPass={setName} onValidate={validateInput} />
            <li className={formClasses.section}>Your own portion</li>
            <li>
                <p className={formClasses.note}>
                    {selected.portions.length > 0 ? `Already has ${selected.portions.map(el => el.label).join(', ')}. ` : ''}
                    Optional: add one you use often, like 1 bottle.
                </p>
            </li>
            <li>
                <ul className={formClasses.group}>
                    <Input key={`${selected.fdcId}-portion`} id="portionName" name="portionName" type="text" label="Name" placeholder="1 bottle" onPass={setPortionName} onValidate={validateInput} isOptional={!portionAmountState.value} />
                    <Input key={`${selected.fdcId}-amount`} id="portionAmount" name="portionAmount" type="number" label={`Amount (${selected.unit})`} placeholder="500" onPass={setPortionAmount} onValidate={validatePositive} isOptional={!portionNameState.value} />
                </ul>
            </li>
        </>}
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

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid} submitText="Add to pantry">
        <Input id="cName" name="customName" type="text" label="Food name" onPass={setName} onValidate={validateInput} placeholder="Protein bar" />

        <li className={formClasses.section}>Serving</li>
        <li>
            <ul className={formClasses.group}>
                <Input id="cServing" name="customServing" type="text" label="Name" note="Optional" onPass={setServingLabel} onValidate={validateInput} isOptional={true} placeholder="1 bottle" />
                <li>
                    <label htmlFor="cUnit">Measured in</label>
                    <select id="cUnit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                        {UNITS.map(el => <option key={el} value={el}>{UNIT_LABELS[el]}</option>)}
                    </select>
                </li>
                {unit !== 'serving' && <Input id="cAmount" name="customAmount" type="number" label={`Size (${unit})`} onPass={setServingAmount} onValidate={validatePositive} placeholder="40" />}
            </ul>
        </li>
        {unit === 'serving' && <li><p className={formClasses.note}>For labels with no weight or volume, like 1 bottle.</p></li>}

        <li className={formClasses.section}>Nutrition per serving</li>
        <li>
            <ul className={formClasses.group}>
                <Input id="cCalories" name="customCalories" type="number" label="Calories" note="Optional" onPass={setCalories} onValidate={validateAmount} isOptional={true} placeholder="Auto" />
                <Input id="cProtein" name="customProtein" type="number" label="Protein (g)" onPass={setProtein} onValidate={validateAmount} placeholder="6" />
                <Input id="cCarbs" name="customCarbs" type="number" label="Carbs (g)" onPass={setCarbs} onValidate={validateAmount} placeholder="15" />
                <Input id="cFat" name="customFat" type="number" label="Fat (g)" onPass={setFat} onValidate={validateAmount} placeholder="16" />
            </ul>
        </li>

        <Input id="cIngredients" name="customIngredients" type="text" label="Ingredients" note="Optional, comma separated" onPass={setIngredients} onValidate={validateInput} isOptional={true} placeholder="Almonds, chicory root fiber, honey" />
    </Form>
}

//Pantry Form - Passed to Modal as a Component
const PantryForm = () => {
    const [source, setSource] = useState('USDA');

    return <>
        <div className={formClasses.lead}>
            <SegmentedControl label="Food source" value={source} onChange={setSource}
                options={[{ id: 'USDA', label: 'Search USDA' }, { id: 'Custom', label: 'From a label' }]} />
        </div>
        {source === 'USDA' ? <UsdaFoodForm /> : <CustomFoodForm />}
    </>
}

export default PantryForm;
