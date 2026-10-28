import classes from './EntryList.module.css'
import DeleteButton from './DeleteButton';
import { STATS } from './StatTile';
import { formatGrams } from '../../assets/food';

export const EntryList = ({ children }) => <ul className={classes.list}>{children}</ul>

export const EmptyState = ({ children }) => <p className={classes.empty}>{children}</p>

// Protein, carbs and fat as small labels with the same colour dots as the stat tiles
export const MacroChips = ({ macros }) => <span className={classes.chips}>
    {['protein', 'carbs', 'fat'].map(key => <span key={key} className={classes.chip}>
        <span className={classes.dot} style={{ backgroundColor: STATS[key].color }} />
        {formatGrams(macros[key])}g {STATS[key].label.toLowerCase()}
    </span>)}
</span>

// One row: name and detail on the left, a headline number on the right.
// Clicking the row (when onClick is given) opens it; the delete button doesn't.
const EntryRow = ({ name, detail, extra, value, unit, onClick, onDelete, deleteLabel, selected }) => {
    const onKeyDown = (e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    }

    return <li className={`${classes.row} ${onClick ? classes.clickable : ''} ${selected ? classes.selected : ''}`} onClick={onClick}
        tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? onKeyDown : undefined} aria-selected={selected}>
        <span className={classes.main}>
            <span className={classes.name} title={name}>{name}</span>
            {detail && <span className={classes.detail} title={detail}>{detail}</span>}
            {extra}
        </span>
        {value !== undefined && <span className={classes.value}>{value}{unit && <span className={classes.unit}>{unit}</span>}</span>}
        {onDelete && <span onClick={e => e.stopPropagation()}>
            <DeleteButton label={deleteLabel} onClick={onDelete} />
        </span>}
    </li>
}

export default EntryRow;
