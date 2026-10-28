import EntryRow, { MacroChips } from '../../UI/EntryList';
import { nutrientBasis } from '../../../assets/food';

const DATA_TYPE_LABELS = { 'SR Legacy': 'USDA', Foundation: 'USDA', Branded: 'Branded', 'Survey (FNDDS)': 'Survey' };

// One USDA search result: "USDA · per 100 g" with its macros
const FilterChoice = ({ food, selected, onSelect, onDelete }) => {
    const detail = [food.brand || DATA_TYPE_LABELS[food.dataType] || food.dataType, nutrientBasis(food),
        food.missing.length > 0 && `no ${food.missing.join(', ')} data`].filter(Boolean).join(' · ');

    return <EntryRow name={food.name} detail={detail} extra={<MacroChips macros={food.nutrients} />}
        value={Math.round(food.nutrients.calories)} unit="kcal" selected={selected}
        onClick={onSelect && (() => onSelect(food))} onDelete={onDelete} deleteLabel="Choose a different food" />
}

export default FilterChoice;
