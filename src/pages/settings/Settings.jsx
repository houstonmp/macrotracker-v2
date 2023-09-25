import { useDispatch } from "react-redux";
import PageContent from "../../components/PageContent";
import classes from "./Settings.module.css"
import { uiActions } from "../../components/store/ui-slice";
import Card from "../../components/UI/Card"

// Import Images from file
import teal from "../../assets/themes/teal.jpg"
import purple from "../../assets/themes/purple.jpg"
import yellow from "../../assets/themes/yellow.jpg"
import green from "../../assets/themes/green.jpg"
import blue from "../../assets/themes/blue.jpg"
import red from "../../assets/themes/red.jpg"

const Background = (props) => {
    return <main className="settings">
        {props.children}
    </main>
}


const SettingsContent = (props) => {
    const dispatch = useDispatch();
    const onThemeChangeHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.setTheme(e.currentTarget.id));
    }
    return <PageContent title="Settings" classes={classes.settings}>
        <Card>
            <h1>Themes</h1>
            <ul className={classes.themeCard}>

                <a id='teal' className={classes['theme-select']} onClick={onThemeChangeHandler}>
                    <img src={teal} alt="Teal Theme" />
                    <p>teal</p>
                </a>
                <a id='purple' className={classes['theme-select']} onClick={onThemeChangeHandler}>
                    <img src={purple} alt="Teal Theme" />
                    <p>purple</p>
                </a>

                <a id='yellow' className={classes['theme-select']} onClick={onThemeChangeHandler}>
                    <img src={yellow} alt="Yellow Theme" />
                    <p>yellow</p>
                </a>

                <a id='green' className={classes['theme-select']} onClick={onThemeChangeHandler}>
                    <img src={green} alt="Green Theme" />
                    <p>green</p>
                </a>

                <a id='blue' className={classes['theme-select']} onClick={onThemeChangeHandler}>
                    <img src={blue} alt="Blue Theme" />
                    <p>blue</p>
                </a>

                <a id='red' className={classes['theme-select']} onClick={onThemeChangeHandler}>
                    <img src={red} alt="Red Theme" />
                    <p>red</p>
                </a>


            </ul>
        </Card>

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