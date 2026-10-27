import classes from './SegmentedControl.module.css'

// A row of pill buttons where one is selected, e.g. Pantry / Recipes / Meals
const SegmentedControl = ({ options, value, onChange, label }) => {
    return <div className={classes.segments} role="tablist" aria-label={label}>
        {options.map(option => <button key={option.id} type="button" role="tab" aria-selected={value === option.id}
            className={value === option.id ? classes.active : ''} onClick={() => onChange(option.id)}>
            {option.label}
            {option.count !== undefined && <span className={classes.count}>{option.count}</span>}
        </button>)}
    </div>
}

export default SegmentedControl;
