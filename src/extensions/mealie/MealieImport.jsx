import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from '../../components/Form/Form';
import formClasses from '../../components/Form/Form.module.css';
import MacroSummary from '../../components/Form/MacroSummary';
import SearchInput from '../../components/UI/SearchInput';
import SegmentedControl from '../../components/UI/SegmentedControl';
import EntryRow, { EntryList, EmptyState } from '../../components/UI/EntryList';
import AmountInput from '../../components/Entry/EntryCard/AmountInput';
import FilterChoice from '../../components/Entry/EntryCard/FilterChoice';
import { recipeListActions } from '../../components/store/recipe-list-slice';
import { uiActions } from '../../components/store/ui-slice';
import { createId, defaultAmount, foodAmountMacros, scaleMacros, sumMacros } from '../../assets/food';
import { fetchUsdaPortions, searchUsda } from '../../assets/usda';
import { findOrCreate, getRecipe, listRecipes, parseIngredients, saveIngredients } from './api';
import { matchesAll, mealieMeasure, singular, normalizeFractions, pantryMatch, parseNumber, rankUsda, readLine, suggestAmount, usdaQuery } from './ingredients';
import classes from './MealieImport.module.css';

const textOf = (ingredient) => (ingredient.originalText || ingredient.display || ingredient.note || '').trim();

// Runs `task` over `items`, a few at a time, so a long recipe doesn't flood USDA
const mapLimit = async (items, limit, task) => {
    const results = new Array(items.length);
    let next = 0;
    const worker = async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await task(items[index], index);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
}

// USDA's best Generic match for an ingredient. "jasmine rice" with nothing that says
// jasmine falls back to plain rice, so there's still a starting point to check.
const usdaSuggestion = async (foodName, unit) => {
    const query = usdaQuery(foodName);
    if (!query) {
        return null;
    }
    const best = async (name) => rankUsda(await searchUsda(usdaQuery(name), 'Generic'), name, unit).find(food => matchesAll(food, name)) || null;
    // Nothing that actually is the ingredient means no suggestion, not USDA's first result
    return (await best(foodName)) || (query.includes(' ') ? best(query.split(' ').pop()) : null);
}

// A USDA food with its household portions ("1 cup", "1 large") added, which cups and
// counts need. If that lookup fails the food still works by weight.
const withPortions = async (food) => {
    if (food.source !== 'usda' || food.dataType === 'Branded') {
        return food;
    }
    try {
        return { ...food, portions: [...food.portions, ...(await fetchUsdaPortions(food.fdcId))] };
    } catch (error) {
        return food;
    }
}

// ---- Step 1: pick a recipe ----

const RecipePicker = ({ onPick }) => {
    const imported = useSelector(state => state.recipes.recipeObj.recipes).filter(recipe => recipe.mealie);
    const [search, setSearch] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let live = true;
        setStatus('loading');
        listRecipes(search)
            .then(items => {
                if (live) {
                    setRecipes(items);
                    setStatus('idle');
                }
            })
            .catch(() => live && setStatus('error'));
        return () => {
            live = false;
        }
    }, [search]);

    let content;
    if (status === 'error') {
        content = <EmptyState>Couldn&apos;t load your Mealie recipes. Check the connection in Settings.</EmptyState>;
    } else if (status === 'loading' && recipes.length === 0) {
        content = <p className={formClasses.note}>Loading your recipes…</p>;
    } else if (recipes.length === 0) {
        content = <EmptyState>{search ? <>No Mealie recipes match &ldquo;{search}&rdquo;.</> : 'Mealie has no recipes yet.'}</EmptyState>;
    } else {
        content = <EntryList>
            {recipes.map(recipe => {
                const already = imported.some(el => el.mealie.slug === recipe.slug);
                const servings = recipe.recipeServings || parseNumber(recipe.recipeYield || '');
                const detail = [already && 'Already in FitPad, importing again replaces it', servings && `${servings} servings`].filter(Boolean).join(' · ');
                return <EntryRow key={recipe.id} name={recipe.name} detail={detail || 'Mealie recipe'} onClick={() => onPick(recipe)} />
            })}
        </EntryList>;
    }

    return <div className={formClasses.dialog}>
        <ul className={formClasses.fields}>
            <li><p className={formClasses.note}>Pick a recipe. You&apos;ll check each ingredient once, and FitPad saves the macros here and the tidied ingredients back to Mealie.</p></li>
            <SearchInput onSearch={setSearch} label="Search your Mealie recipes" />
            <li>{content}</li>
        </ul>
    </div>
}

// ---- Step 2: check each ingredient ----

// 'skipped', 'needs' (no food, no amount, or not looked at yet) or 'ok'
const lineStatus = (line) => {
    if (line.skip) {
        return 'skipped';
    }
    if (!line.food || !line.amount || !(Number(line.amount.quantity) > 0) || !line.reviewed) {
        return 'needs';
    }
    return 'ok';
}

const STATUS_LABELS = { ok: 'Looks right', needs: 'Needs a look', skipped: 'Not counted' };

// Search the pantry and USDA for a different food
const FoodPicker = ({ initialQuery, pantry, onPick }) => {
    const [query, setQuery] = useState(initialQuery);
    const [dataType, setDataType] = useState('Generic');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('idle');

    const pantryResults = query.trim() ? pantry.filter(food => food.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5) : [];

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        let live = true;
        setStatus('loading');
        searchUsda(query, dataType)
            .then(foods => {
                if (live) {
                    setResults(rankUsda(foods, query).slice(0, 8));
                    setStatus('idle');
                }
            })
            .catch(() => live && setStatus('error'));
        return () => {
            live = false;
        }
    }, [query, dataType]);

    const onUsdaPick = async (food) => {
        onPick(await withPortions(food), 'usda');
    }

    return <div className={classes.picker}>
        <ul className={classes.pickerFields}>
            <SearchInput onSearch={setQuery} defaultValue={initialQuery} label="Search your pantry and USDA" />
        </ul>
        <SegmentedControl label="USDA data" value={dataType} onChange={setDataType}
            options={[{ id: 'Generic', label: 'Generic' }, { id: 'Branded', label: 'Branded' }]} />
        <EntryList>
            {pantryResults.map(food => <EntryRow key={food.id} name={food.name} detail="Your pantry" onClick={() => onPick(food, 'pantry')} />)}
            {results.map(food => <FilterChoice key={food.fdcId} food={food} onSelect={onUsdaPick} />)}
        </EntryList>
        {status === 'loading' && <p className={formClasses.note}>Searching USDA…</p>}
        {status === 'error' && <p className={formClasses.note}>Couldn&apos;t reach USDA. Try again in a moment.</p>}
        {status === 'idle' && query.trim() && results.length === 0 && pantryResults.length === 0 && <p className={formClasses.note}>No foods match.</p>}
    </div>
}

const IngredientLine = ({ line, pantry, onChange }) => {
    const [picking, setPicking] = useState(false);
    const status = lineStatus(line);
    const shownAmount = line.food && (line.amount || defaultAmount(line.food));
    const calories = line.food && !line.skip ? Math.round(foodAmountMacros({ food: line.food, ...shownAmount }).calories) : null;

    const onPickHandler = (food, source) => {
        setPicking(false);
        onChange({ food, source, amount: suggestAmount(food, line.read), reviewed: true });
    }

    let hint = null;
    if (!line.skip && line.food && !line.amount) {
        const said = [line.read.quantity, line.read.unitName].filter(Boolean).join(' ');
        hint = said ? `The recipe says "${said}" and this food has no size for that. Set the amount.` : "The recipe doesn't say how much. Set the amount.";
    } else if (!line.skip && !line.food) {
        hint = line.searching ? 'Looking for a match…' : 'No match found. Pick a food.';
    }

    return <li className={`${classes.line} ${classes[status]}`}>
        <div className={classes.lineHead}>
            <span className={classes.original}>{line.text}</span>
            <span className={classes.chip}>{STATUS_LABELS[status]}</span>
        </div>

        {!line.skip && <>
            <div className={classes.foodRow}>
                <span className={classes.foodName}>
                    {line.food ? line.food.name : '—'}
                    {line.food && <small>{line.source === 'pantry' ? 'Your pantry' : 'USDA'}</small>}
                </span>
                <button type="button" className={classes.textButton} onClick={() => setPicking(open => !open)}>
                    {picking ? 'Close' : line.food ? 'Change' : 'Pick food'}
                </button>
            </div>
            {picking && <FoodPicker initialQuery={line.read.foodName || line.text} pantry={pantry} onPick={onPickHandler} />}
            {line.food && <div className={classes.amountRow}>
                <AmountInput food={line.food} value={shownAmount} onChange={amount => onChange({ amount, reviewed: true })} />
                <span className={classes.calories}>{calories} kcal</span>
            </div>}
            {hint && <p className={classes.hint}>{hint}</p>}
        </>}

        <div className={classes.actions}>
            {status === 'needs' && line.food && <button type="button" className={classes.textButton}
                onClick={() => onChange({ amount: shownAmount, reviewed: true })}>Looks right</button>}
            <button type="button" className={classes.textButton} onClick={() => onChange({ skip: !line.skip, reviewed: true })}>
                {line.skip ? 'Count it' : "Don't count"}
            </button>
        </div>
    </li>
}

const IngredientMatcher = ({ summary, onBack }) => {
    const dispatch = useDispatch();
    const recipeObj = useSelector(state => state.recipes.recipeObj);
    const [recipe, setRecipe] = useState(null);
    const [lines, setLines] = useState([]);
    const [name, setName] = useState(summary.name);
    const [servings, setServings] = useState(String(summary.recipeServings || parseNumber(summary.recipeYield || '') || 1));
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let live = true;
        const updateLine = (index, changes) => live && setLines(prev => prev.map((el, n) => (n === index ? { ...el, ...changes } : el)));

        (async () => {
            const full = await getRecipe(summary.slug);
            const ingredients = full.recipeIngredient || [];
            const texts = ingredients.map(textOf);

            // Lines Mealie already has parsed keep their food; the rest go through the
            // parser, with fractions like ¹/₂ written out first since it can't read them
            const toParse = ingredients.map((el, n) => (el.food && el.food.id ? null : n)).filter(n => n !== null && texts[n]);
            const parsedResults = toParse.length > 0 ? await parseIngredients(toParse.map(n => normalizeFractions(texts[n]))) : [];
            const parsedFor = Object.fromEntries(toParse.map((n, i) => [n, { ...parsedResults[i].ingredient, confidence: (parsedResults[i].confidence || {}).average }]));

            const initial = ingredients.map((el, n) => {
                const read = readLine(parsedFor[n] || el, texts[n]);
                const skip = !texts[n] || read.skip;
                const food = skip ? null : pantryMatch(recipeObj.items, read.foodName);
                const amount = food ? suggestAmount(food, read) : null;
                return {
                    key: el.referenceId || n, text: texts[n], read, skip, food, amount,
                    source: food ? 'pantry' : null,
                    // A pantry food with an amount straight from a confidently parsed line
                    // is the only thing that starts out as looking right
                    reviewed: Boolean(food && amount && read.confidence >= 0.8),
                    searching: !skip && !food && Boolean(read.foodName),
                };
            });
            if (!live) {
                return;
            }
            setRecipe(full);
            setLines(initial);
            setStatus('ready');

            // Lines with no pantry match get USDA's top Generic result as a suggestion
            await mapLimit(initial.map((line, n) => [line, n]).filter(([line]) => line.searching), 4, async ([line, n]) => {
                try {
                    const top = await usdaSuggestion(line.read.foodName, line.read.unit);
                    const food = top ? await withPortions(top) : null;
                    updateLine(n, { food, source: food ? 'usda' : null, amount: food ? suggestAmount(food, line.read) : null, searching: false });
                } catch (error) {
                    updateLine(n, { searching: false });
                }
            });
        })().catch(() => live && setStatus('error'));

        return () => {
            live = false;
        }
        // Matches against the pantry as it was when the recipe opened; adding foods
        // while checking lines shouldn't start the matching over
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [summary.slug]);

    const onLineChange = (index, changes) => {
        setLines(prev => prev.map((el, n) => (n === index ? { ...el, ...changes } : el)));
    }

    const counted = lines.filter(line => lineStatus(line) === 'ok');
    const needs = lines.filter(line => lineStatus(line) === 'needs').length;
    const servingCount = Number(servings);
    const totals = sumMacros(counted.map(line => foodAmountMacros({ food: line.food, ...line.amount })));
    const formIsValid = status === 'ready' && needs === 0 && counted.length > 0 && name.trim() !== '' && servingCount > 0;

    const saveToMealie = async () => {
        // One lookup per name, so two lines of "garlic" don't create two foods
        const cache = new Map();
        const lookup = (kind, value) => {
            const key = `${kind}:${value.toLowerCase()}`;
            if (!cache.has(key)) {
                // Prefer an existing singular food over creating a plural one
                cache.set(key, kind === 'foods' && singular(value)
                    ? findOrCreate(kind, singular(value), [value])
                    : findOrCreate(kind, value));
            }
            return cache.get(key);
        }
        const original = recipe.recipeIngredient || [];
        const updated = await Promise.all(original.map(async (ingredient, n) => {
            const line = lines[n];
            // Lines that aren't counted stay exactly as they were
            if (!line || lineStatus(line) !== 'ok') {
                return ingredient;
            }
            const measure = mealieMeasure({ line: line.read, food: line.food, amount: line.amount });
            const [food, unit] = await Promise.all([
                lookup('foods', measure.foodName),
                measure.unitName ? lookup('units', measure.unitName) : null,
            ]);
            return {
                ...ingredient,
                quantity: measure.quantity,
                unit,
                food,
                note: measure.note,
                // Keep the recipe's own wording alongside the tidy version
                originalText: ingredient.originalText || line.text,
            };
        }));
        await saveIngredients(recipe.slug, updated);
    }

    const submitHandler = () => {
        if (!formIsValid) {
            return false;
        }
        setStatus('saving');
        setMessage('');

        // Foods picked from USDA join the pantry, so the next recipe matches them straight away
        const pantryIds = new Set(recipeObj.items.map(food => food.fdcId).filter(Boolean));
        counted.filter(line => line.source === 'usda' && !pantryIds.has(line.food.fdcId)).forEach(line => {
            pantryIds.add(line.food.fdcId);
            dispatch(recipeListActions.addEntry({ list: 'items', data: line.food }));
        });

        // Importing again replaces the earlier copy
        recipeObj.recipes.filter(el => el.mealie && el.mealie.slug === recipe.slug)
            .forEach(el => dispatch(recipeListActions.removeEntry({ list: 'recipes', id: el.id })));
        dispatch(recipeListActions.addEntry({
            list: 'recipes',
            data: {
                id: createId(),
                name: name.trim(),
                servings: servingCount,
                instructions: '',
                img: '',
                ingredients: counted.map(line => ({ food: line.food, quantity: Number(line.amount.quantity), portion: line.amount.portion })),
                mealie: { slug: recipe.slug, id: recipe.id },
            }
        }));

        saveToMealie()
            .then(() => dispatch(uiActions.closeModal()))
            .catch(() => {
                setStatus('ready');
                setMessage("Saved in FitPad, but Mealie couldn't be updated. Its ingredients are unchanged; you can import again later to tidy them.");
            });
        // The modal closes once Mealie has been updated
        return false;
    }

    if (status === 'loading') {
        return <p className={formClasses.note}>Reading {summary.name} and matching its ingredients…</p>;
    }
    if (status === 'error') {
        return <>
            <EmptyState>Couldn&apos;t read this recipe from Mealie.</EmptyState>
            <button type="button" className={classes.textButton} onClick={onBack}>Back to recipes</button>
        </>;
    }

    return <Form onFormSubmit={submitHandler} formIsValid={formIsValid}
        submitText={status === 'saving' ? 'Saving…' : 'Save to FitPad & Mealie'}>
        <li>
            <button type="button" className={classes.textButton} onClick={onBack}>← All recipes</button>
        </li>
        <li>
            <ul className={formClasses.group}>
                <li>
                    <label htmlFor="mealieName">Name in FitPad</label>
                    <input id="mealieName" type="text" value={name} onChange={e => setName(e.target.value)} />
                </li>
                <li>
                    <label htmlFor="mealieServings">Servings</label>
                    <input id="mealieServings" type="number" min="0" step="any" value={servings} onChange={e => setServings(e.target.value)} />
                </li>
            </ul>
        </li>

        <li className={formClasses.section}>Ingredients · {needs > 0 ? `${needs} need${needs === 1 ? 's' : ''} a look` : 'all checked'}</li>
        <li>
            <ul className={classes.lines}>
                {lines.map((line, n) => <IngredientLine key={line.key} line={line} pantry={recipeObj.items}
                    onChange={changes => onLineChange(n, changes)} />)}
            </ul>
        </li>

        {counted.length > 0 && <li>
            <MacroSummary label="Total" detail={servingCount > 1 ? `${Math.round(scaleMacros(totals, 1 / servingCount).calories)} kcal per serving` : null} macros={totals} />
        </li>}
        {message && <li><p className={classes.error} role="alert">{message}</p></li>}
    </Form>
}

// Import from Mealie - Passed to Modal as a Component
const MealieImport = () => {
    const [summary, setSummary] = useState(null);
    return summary
        ? <IngredientMatcher summary={summary} onBack={() => setSummary(null)} />
        : <RecipePicker onPick={setSummary} />;
}

export default MealieImport;
