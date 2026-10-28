import classes from './Form.module.css';
import { MacroChips } from '../UI/EntryList';

// "Total" with the macro chips on the left and the calories large on the right
const MacroSummary = ({ label, detail, macros }) => <div className={classes.summary}>
    <span className={classes.summaryMain}>
        <span className={classes.summaryLabel}>{label}{detail && ` · ${detail}`}</span>
        <MacroChips macros={macros} />
    </span>
    <span className={classes.summaryValue}>{Math.round(macros.calories)}<small>kcal</small></span>
</div>

export default MacroSummary;
