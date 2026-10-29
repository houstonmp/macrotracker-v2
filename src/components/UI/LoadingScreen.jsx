import Waves from '../../assets/Waves';
import classes from './LoadingScreen.module.css';

// Shown while Firebase restores your sign-in and your data loads, in your saved theme
const LoadingScreen = ({ failed, onRetry }) => <>
    <div className={classes.screen} role="status" aria-live="polite">
        <img className={classes.logo} src="/healthapp.png" alt="" />
        <span className={classes.name}>FitPad</span>
        {failed ? <>
            <p className={classes.message}>Couldn&apos;t load your data. Check your connection and try again.</p>
            <button type="button" className={classes.retry} onClick={onRetry}>Try again</button>
        </> : <span className={classes.dots} aria-label="Loading"><span /><span /><span /></span>}
    </div>
    <Waves />
</>

export default LoadingScreen;
