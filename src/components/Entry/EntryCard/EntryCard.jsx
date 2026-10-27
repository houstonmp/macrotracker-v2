import Card from '../../UI/Card'
import CardHeader from '../../UI/CardHeader';
import EntryRow, { EntryList, EmptyState, MacroChips } from '../../UI/EntryList';
import classes from './EntryCard.module.css'
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import SearchInput from '../../UI/SearchInput';
import SegmentedControl from '../../UI/SegmentedControl';
import { BasketIcon } from '../../../assets/StatIcons';
import { recipeListActions } from '../../store/recipe-list-slice';
import { uiActions } from '../../store/ui-slice';
import { ingredientNames, listEntryBasis, listEntryMacros } from '../../../assets/food';

const TABS = [
    { id: 'items', title: 'Pantry', hint: 'Foods you keep on hand, from USDA or your own labels', modal: 'item', createText: '+ Add to Pantry' },
    { id: 'recipes', title: 'Recipes', hint: 'Dishes made from pantry foods', modal: 'recipe', createText: '+ New Recipe' },
    { id: 'meals', title: 'Meals', hint: 'Pantry foods and recipes eaten together', modal: 'meal', createText: '+ New Meal' },
];

// "per serving · eggs, spinach, feta"
const entryDetail = (list, entry) => {
    const ingredients = ingredientNames(list, entry).map(name => name.split(',')[0]);
    return [listEntryBasis(list, entry), ingredients.join(', ')].filter(Boolean).join(' · ');
}

const EntryCard = (props) => {
    const dispatch = useDispatch();
    const [navState, setNavState] = useState('recipes');
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

    return <Card classes={props.classes}>
        <CardHeader Icon={BasketIcon} title="Foods" subtitle={tab.hint}>
            <button type="button" name={tab.modal} onClick={props.onModal}>{tab.createText}</button>
        </CardHeader>

        <SegmentedControl label="Food lists" value={navState} onChange={setNavState}
            options={TABS.map(el => ({ id: el.id, label: el.title, count: props.foodItems[el.id].length }))} />

        <ul className={classes.search}>
            <SearchInput onSearch={setFilterValue} label={`Search ${tab.title.toLowerCase()} by name or ingredient`} />
        </ul>

        {foodItems.length > 0 && <EntryList>
            {foodItems.map(entry => {
                const macros = listEntryMacros(navState, entry);
                return <EntryRow key={entry.id}
                    name={entry.name}
                    detail={entryDetail(navState, entry)}
                    extra={<MacroChips macros={macros} />}
                    value={Math.round(macros.calories)} unit="kcal"
                    onClick={() => onLogHandler(entry)}
                    onDelete={() => onDeleteHandler(entry)} deleteLabel={`Delete ${entry.name}`} />
            })}
        </EntryList>}
        {props.foodItems[navState].length === 0 && <EmptyState>Nothing here yet. Use &apos;{tab.createText.slice(2)}&apos; to get started.</EmptyState>}
        {props.foodItems[navState].length > 0 && foodItems.length === 0 && <EmptyState>Nothing matches &apos;{filterValue}&apos;.</EmptyState>}
        {foodItems.length > 0 && <p className={classes.tip}>Tap a row to log it to today&apos;s diary.</p>}
    </Card >
}

export default EntryCard;
