import classes from './StatTile.module.css'
import { HeartIcon, BoltIcon, TargetIcon, EggIcon, WheatIcon, DropIcon } from '../../assets/StatIcons';

// One look for every number tile, so totals and targets read as the same data.
// Mid-tone accents that work on both the light and dark themes.
export const STATS = {
    BMR: { label: 'BMR', unit: 'kcal', Icon: HeartIcon, color: '#d9667a' },
    TDEE: { label: 'TDEE', unit: 'kcal', Icon: BoltIcon, color: '#d9962b' },
    calories: { label: 'Calories', unit: 'kcal', Icon: TargetIcon, color: '#3e9e6e' },
    protein: { label: 'Protein', unit: 'g', Icon: EggIcon, color: '#3f7fcb' },
    carbs: { label: 'Carbs', unit: 'g', Icon: WheatIcon, color: '#b8941f' },
    fat: { label: 'Fat', unit: 'g', Icon: DropIcon, color: '#8e6cc9' },
};

export const StatGrid = ({ columns, children }) =>
    <div className={classes.wrap}>
        <ul className={classes.tiles} style={{ '--columns': columns }}>{children}</ul>
    </div>

// With a goal, shows "value / goal" and a bar filling toward it. `note` flags a number
// that isn't the whole story, e.g. calories logged without a macro split.
const StatTile = ({ stat, label, value, goal, hint, note }) => {
    const { Icon, color, unit } = STATS[stat];
    const hasGoal = goal > 0;
    const progress = hasGoal ? Math.min(value / goal, 1) * 100 : 0;

    return <li className={classes.tile}>
        <span className={classes.icon} style={{ backgroundColor: `${color}2e` }}><Icon color={color} /></span>
        <span className={classes.text}>
            <span className={classes.label}>{label || STATS[stat].label}</span>
            <span className={classes.value}>
                {Math.round(value)}
                {hasGoal && <span className={classes.goal}> / {Math.round(goal)}</span>}
                <span className={classes.unit}>{unit}</span>
            </span>
            {hasGoal && <span className={classes.track} style={{ backgroundColor: `${color}2e` }}>
                <span className={classes.fill} style={{ width: `${progress}%`, backgroundColor: color }} />
            </span>}
            {hint && <span className={classes.hint}>{hint}</span>}
            {note && <span className={classes.note}>{note}</span>}
        </span>
    </li>
}

export default StatTile;
