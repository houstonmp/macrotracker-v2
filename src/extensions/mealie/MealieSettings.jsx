import { useDispatch } from 'react-redux';
import Card from '../../components/UI/Card';
import CardHeader from '../../components/UI/CardHeader';
import { ChefHatIcon } from '../../assets/StatIcons';
import { uiActions } from '../../components/store/ui-slice';
import useMealie from './useMealie';
import classes from './MealieSettings.module.css';

const STATUS = {
    connected: { tone: 'good', text: (m) => `Connected as ${m.username}${m.version ? ` · Mealie ${m.version}` : ''}` },
    unauthorized: {
        tone: 'warn', text: () => 'Mealie rejected the API token.',
        help: 'In Mealie, open your profile → API Tokens and create one, put it after MEALIE_TOKEN= in ~/fitpad/.env, then run docker compose up -d in ~/fitpad.',
    },
    unreachable: { tone: 'warn', text: () => "Couldn't reach Mealie. It may be stopped or restarting." },
    error: { tone: 'warn', text: () => 'Mealie answered with an error. Try again in a moment.' },
    checking: { tone: 'idle', text: () => 'Checking…' },
};

// Only shown where the Mealie proxy is set up, so the public site never mentions it
const MealieSettings = ({ classes: cardClasses }) => {
    const dispatch = useDispatch();
    const mealie = useMealie();

    if (!mealie.available) {
        return null;
    }

    const onToggleHandler = () => {
        dispatch(uiActions.updateSettings({ mealieEnabled: !mealie.enabled }));
    }

    const status = mealie.checking ? STATUS.checking : STATUS[mealie.status] || STATUS.error;

    return <Card classes={cardClasses}>
        <CardHeader Icon={ChefHatIcon} title="Mealie" subtitle="Import recipes and meal plans from your Mealie server">
            <button type="button" onClick={onToggleHandler}>{mealie.enabled ? 'Turn off' : 'Turn on'}</button>
        </CardHeader>
        {mealie.enabled ? <>
            <p className={`${classes.status} ${classes[status.tone]}`} role="status">
                <span className={classes.dot} />
                {status.text(mealie)}
            </p>
            {status.help && <p className={classes.help}>{status.help}</p>}
            <button type="button" className={classes.recheck} onClick={mealie.recheck} disabled={mealie.checking}>Check again</button>
        </> : <p className={classes.help}>Off. FitPad won&apos;t use Mealie until you turn it back on.</p>}
    </Card>
}

export default MealieSettings;
