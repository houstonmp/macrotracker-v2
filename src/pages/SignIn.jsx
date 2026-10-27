import Button from "../components/UI/Button";
import classes from "./SignIn.module.css"
import Input from "../components/UI/Input"
import { useState } from "react";
import Form from '../components/Form/Form'
import { GoogleIcon } from "../assets/Icons";
import { createUser, signinUser, signInWithGoogle, isInFrame, authErrorMessage } from "../Firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SignIn = () => {
    const validatePassword = (value) => value.trim() !== '';
    const validateEmail = (value) => value.trim() !== '' && value.includes('@');
    const [emailValue, setEmail] = useState({});
    const [passwordValue, setPassword] = useState({});
    const [signupState, setSignup] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const showError = (err) => setError(authErrorMessage(err));

    const onGoogleSignIn = () => {
        setError('');
        signInWithGoogle().catch(showError);
    };
    const onGuestLogin = () => {
        if (signupState) {
            setError('');
            signinUser("testEmail@gmail.com", "123456").catch(showError);
        }
    };
    const emailToForm = (inputObj) => setEmail(inputObj);
    const passwordToForm = (inputObj) => setPassword(inputObj);

    let formIsValid = false;

    if (emailValue.isValid && passwordValue.isValid) {
        formIsValid = true;
    }

    const onFormSubmitHandler = () => {
        setError('');
        if (formIsValid && !signupState) {
            createUser(emailValue.value, passwordValue.value).catch(showError);
        } else if (formIsValid && signupState) {
            signinUser(emailValue.value, passwordValue.value).catch(showError);
        }
    }

    const toggleSignup = () => {
        setSignup(prev => !prev);
    }

    useEffect(() => {
        let authToken = sessionStorage.getItem('Auth Token')
        if (authToken) {
            navigate('')
        }
    }, [])

    return <>
        <div className="signInScreen">
            <div className={classes.signin}>
                <Form className={classes.section} overloadFooter={true} onFormSubmit={onFormSubmitHandler}>
                    <div className={classes.signInContainer}>
                        <div className={classes.signinItem}><h1>{signupState ? 'Login to' : 'Sign up for'} <span className={classes.fitColor}>Fit</span>Pad</h1></div>

                        <button type="button" className={`${classes.googleSignIn}`} onClick={onGoogleSignIn}><GoogleIcon /><span>Sign In With Google</span></button>

                        {isInFrame &&
                            <p className={classes.signinItem}>
                                Google sign-in may not work inside another app like Home Assistant. Open FitPad in its own browser tab once, set a password under Settings, then sign in here with your email and password.
                            </p>}

                        <hr className={classes.hrText} data-content="OR"></hr>

                        <div className={classes.signinItem}>
                            <Input placeholder="Email" type="email" onValidate={validateEmail} onPass={emailToForm}></Input>
                        </div>
                        <div className={classes.signinItem}>
                            <Input placeholder="Password" type="password" onValidate={validatePassword} onPass={passwordToForm}></Input>
                        </div>
                        <div className={`${classes.signinItem} ${!signupState && classes.privacyPolicy}`}>
                            {signupState ?
                                <a onClick={toggleSignup}><i className={classes.fitColor}>Forgot Password?</i></a> :
                                <>
                                    <input type="checkbox"></input>
                                    <div>Agree to the<a onClick={toggleSignup}><i className={classes.fitColor}>Privacy Policy</i></a></div>
                                </>
                            }

                        </div>
                        <div className={classes.signinItem}>
                            {signupState ?
                                <Button type="submit" classes={classes.signinItem} disable={!formIsValid}>Log in!</Button> :
                                <Button type="submit" classes={classes.signinItem} disable={!formIsValid}>Sign Up!</Button>
                            }
                            {signupState &&
                                <Button type="button" classes={classes.signinItem} onClick={onGuestLogin}>Guest User</Button>}
                        </div>


                        {error && <p className={`${classes.signinItem} ${classes.error}`} role="alert">{error}</p>}

                        {signupState ?
                            <p>Don't have an account? <a onClick={toggleSignup}><i className={classes.fitColor}>Sign up here!</i></a></p> :
                            <p>Already have an account?<a onClick={toggleSignup}><i className={classes.fitColor}>Login here!</i></a></p>
                        }

                    </div>
                </Form >
            </div>
        </div >
    </>
}

export default SignIn;