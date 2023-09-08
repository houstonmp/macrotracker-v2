import { useDispatch } from "react-redux";
import PageContent from "../../components/PageContent";
import classes from "./Settings.module.css"
import { uiActions } from "../../components/store/ui-slice";

const Background = (props) => {
    return <main className="settings">
        {props.children}
    </main>
}


const SettingsContent = (props) => {
    const dispatch = useDispatch();
    const onThemeChangeHandler = (e) => {
        e.preventDefault();
        console.log(e.target.id);
        dispatch(uiActions.setTheme(e.target.id));
    }
    return <PageContent title="Settings" classes={classes.settings}>
        <h1>Themes</h1>
        <ul>
            <li>
                <a id='default' className={classes['theme-select']} onClick={onThemeChangeHandler}>default</a>
            </li>
            <li>
                <a id='purple' className={classes['theme-select']} onClick={onThemeChangeHandler}>purple</a>
            </li>
            <li>
                <a id='yellow' className={classes['theme-select']} onClick={onThemeChangeHandler}>yellow</a>
            </li>
            <li>
                <a id='green' className={classes['theme-select']} onClick={onThemeChangeHandler}>green</a>
            </li>

        </ul>
    </PageContent>
}

const Settings = props => {
    return <>
        <div className={classes.settings}>
            <Background>
                <SettingsContent></SettingsContent>
            </Background>
        </div>
    </>
}

export default Settings;