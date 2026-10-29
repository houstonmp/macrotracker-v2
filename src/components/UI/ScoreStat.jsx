import classes from './ScoreStat.module.css';

// The dot's label says it in words for screen readers and on hover, so it doesn't rely
// on colour alone
const TONES = {
    good: { className: classes.toneGood, label: 'On track' },
    close: { className: classes.toneClose, label: 'Close' },
    work: { className: classes.toneWork, label: 'Work on this' },
};

// One tile: title (with a coloured dot when it's graded), a number and a hint
const ScoreStat = ({ label, value, hint, tone }) => <li className={classes.stat}>
    <span className={classes.statLabel}>
        {tone && <span className={`${classes.toneDot} ${TONES[tone].className}`} role="img"
            aria-label={TONES[tone].label} title={TONES[tone].label} />}
        {label}
    </span>
    <span className={classes.statValue}>{value}</span>
    {hint && <span className={classes.statHint}>{hint}</span>}
</li>

export default ScoreStat;
