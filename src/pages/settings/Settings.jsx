import { useDispatch, useSelector } from "react-redux";
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


import { signOutWithGoogle } from "../../Firebase";
import Button from "../../components/UI/Button";


const Background = (props) => {
    return <main className="settings">
        {props.children}
    </main>
}


const SettingsContent = (props) => {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.ui.userPreferences.user);
    const onThemeChangeHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.setTheme(e.currentTarget.id));
    }
    const onClickHandler = () => {
        signOutWithGoogle();
        window.location.reload();
    }

    return <PageContent title="Settings" classes={classes.settings}>
        <Card classes={classes.userProfile}>
            {userData.imgURL && <img className={classes.userImg} src={userData.imgURL}></img>}
            <ul className={classes.userInfo}>
                {userData.name && <li>Name: {userData.name}</li>}
                <li>Email: {userData.email}</li>
            </ul>
            <Button onClick={onClickHandler}>Signout</Button>
        </Card>
        <Card classes={classes.userProfile}>
            <p>Age: {userData && userData.age}</p>
            <p>Birthday: {userData && userData.birthday}</p>
            <p>Height: {userData.height && userData.height.in}</p>
            <p>Preferred Unit: Imperial (lbs, in)</p>

        </Card>
        <Card classes={classes.themes}>
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