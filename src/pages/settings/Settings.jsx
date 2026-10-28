import { useState } from "react";
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


import { signOutWithGoogle, hasPasswordSignIn, setAccountPassword, authErrorMessage } from "../../Firebase";
import { getAgeFromBirthday } from "../../assets/functions";
import Button from "../../components/UI/Button";
import MealieSettings from "../../extensions/mealie/MealieSettings";


const Background = (props) => {
    return <main className="settings">
        {props.children}
    </main>
}


// Google sign-in can't finish inside a Home Assistant frame, so a Google account can
// add a password and sign in there with email instead
const PasswordSignIn = () => {
    const [enabled, setEnabled] = useState(hasPasswordSignIn());
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const onSubmitHandler = (e) => {
        e.preventDefault();
        setAccountPassword(password)
            .then(() => {
                setEnabled(true);
                setPassword('');
                setMessage('Saved. You can now sign in with your email and this password.');
            })
            .catch(error => setMessage(authErrorMessage(error)));
    }

    return <Card classes={classes.userProfile}>
        <h1>Password sign-in</h1>
        <p>
            {enabled ?
                'Password sign-in is on. Use it where Google sign-in doesn\'t work, like inside Home Assistant.' :
                'Add a password to sign in with your email where Google sign-in doesn\'t work, like inside Home Assistant.'}
        </p>
        <form className={classes.passwordForm} onSubmit={onSubmitHandler}>
            <label htmlFor="new-password">{enabled ? 'New password' : 'Password'}</label>
            <input id="new-password" type="password" autoComplete="new-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            <Button type="submit" disable={password.length < 6}>{enabled ? 'Change password' : 'Add password'}</Button>
        </form>
        {message && <p role="status">{message}</p>}
    </Card>
}

const SettingsContent = () => {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.ui.userPreferences.user);
    const onThemeChangeHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.setTheme(e.currentTarget.id));
    }
    const onSexChangeHandler = (e) => {
        dispatch(uiActions.updateUser({ sex: e.target.value }));
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
            <p>Age: {userData.birthday && getAgeFromBirthday(userData.birthday)}</p>
            <p>Birthday: {userData && userData.birthday}</p>
            <p>Height: {userData.height && userData.height.in}</p>
            <p>
                <label htmlFor="sex">Sex (for calorie estimate): </label>
                <select id="sex" value={userData.sex || ''} onChange={onSexChangeHandler}>
                    {!userData.sex && <option value="">Not set (using male formula)</option>}
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </p>
            <p>Preferred Unit: Imperial (lbs, in)</p>

        </Card>
        {(userData.email || '').toLowerCase() !== 'testemail@gmail.com' && <PasswordSignIn />}
        <MealieSettings classes={classes.userProfile} />
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

const Settings = () => {
    return <>
        <div className={classes.settings}>
            <Background>
                <SettingsContent></SettingsContent>
            </Background>
        </div>
    </>
}

export default Settings;