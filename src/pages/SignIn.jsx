import { signInWithGoogle } from "../Firebase"
import Button from "../components/UI/Button";
import classes from "./SignIn.module.css"
import Input from "../components/UI/Input"
import { useState } from "react";
import Form from '../components/Form/Form'
import { GoogleIcon } from "../assets/Icons";
import { createUser, signinUser } from "../Firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const SignIn = (props) => {
    const validatePassword = (value) => value.trim() !== '';
    const validateEmail = (value) => value.trim() !== '' && value.includes('@');
    const [emailValue, setEmail] = useState({});
    const [passwordValue, setPassword] = useState({});
    const [signupState, setSignup] = useState(true);
    const navigate = useNavigate();
    const onGuestLogin = () => {
        if (signupState) {
            signinUser("testEmail@gmail.com", "123456");
        }
    };
    const emailToForm = (inputObj) => setEmail(inputObj);
    const passwordToForm = (inputObj) => setPassword(inputObj);

    let formIsValid = false;

    if (emailValue.isValid && passwordValue.isValid) {
        formIsValid = true;
    }

    const onFormSubmitHandler = (e) => {
        if (formIsValid && !signupState) {
            createUser(emailValue.value, passwordValue.value);
        } else if (formIsValid && signupState) {
            signinUser(emailValue.value, passwordValue.value);
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
                    {/* <SignInBG classes={classes.signInBg} /> */}
                    <div className={classes.signInContainer}>
                        <div className={classes.signinItem}><h1>{signupState ? 'Login to' : 'Sign up for'} <span className={classes.fitColor}>Fit</span>Pad</h1></div>

                        <button type="button" className={`${classes.googleSignIn}`} onClick={props.onSignIn}><GoogleIcon /><span>Sign In With Google</span></button>

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


                        {signupState ?
                            <p>Don't have an account? <a onClick={toggleSignup}><i className={classes.fitColor}>Sign up here!</i></a></p> :
                            <p>Already have an account?<a onClick={toggleSignup}><i className={classes.fitColor}>Login here!</i></a></p>
                        }



                        {/* {signupState && <> <button className={`${classes.googleSignIn}`} onClick={props.onSignIn}><GoogleIcon /><span>Sign In With Google</span></button>

                    <hr className={classes.hrText} data-content="OR"></hr>


                    <div className={classes.signinItem}>
                        <Input placeholder="Email" type="email" onValidate={validateInput} onPass={emailToForm}></Input>
                    </div>
                    <div className={classes.signinItem}>
                        <Input placeholder="Password" type="password" onValidate={validateInput} onPass={emailToForm}></Input>
                    </div>
                    <div className={`${classes.signinItem} ${classes.privacyPolicy}`}>

                    </div>
                    <div className={classes.signinItem}>

                    </div>


                    <
                </>
                } */}

                    </div>
                </Form >
            </div>
        </div >
    </>
}

export default SignIn;