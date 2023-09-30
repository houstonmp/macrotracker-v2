import { signInWithGoogle } from "../Firebase"
import Button from "../components/UI/Button";
import classes from "./SignIn.module.css"
import Input from "../components/UI/Input"
import { useState } from "react";
import Form from '../components/Form/Form'
import { SignInBG } from "../assets/Waves";
import { GoogleIcon } from "../assets/Icons";

const SignIn = (props) => {
    const validateInput = (value) => value.trim() !== '';
    const [emailValue, setEmail] = useState({});
    const [signupState, setSignup] = useState(true);

    const emailToForm = (inputObj) => setEmail(inputObj);
    const toggleSignup = () => {
        setSignup(prev => !prev);
    }

    return <>
        <Form className={classes.section} overloadFooter={true}>
            {/* <SignInBG classes={classes.signInBg} /> */}
            <div className={classes.signInContainer}>
                <div className={classes.signinItem}><h1>Login to <span className={classes.fitColor}>Fit</span>Pad</h1></div>
                {!signupState && <>
                    {/* <div>Please login to use the app.</div> */}
                    <button className={`${classes.googleSignIn}`} onClick={props.onSignIn}><GoogleIcon /><span>Sign In With Google</span></button>

                    {/* <div className={classes.signinItem}> */}
                    <hr className={classes.hrText} data-content="OR"></hr>
                    {/* <p>---Or---</p> */}
                    {/* </div> */}
                    <div className={classes.signinItem}>
                        <Input placeholder="Email" type="email" onValidate={validateInput} onPass={emailToForm}></Input>
                    </div>
                    <div className={classes.signinItem}>
                        <Input placeholder="Password" type="password" onValidate={validateInput} onPass={emailToForm}></Input>
                    </div>
                    <div className={classes.signinItem}>
                        <a onClick={toggleSignup}><span className={classes.fitColor}>Forgot Password?</span></a>
                    </div>
                    <div className={classes.signinItem}>
                        <Button onClick={props.onSignIn} classes={classes.signinItem}>Log in!</Button>
                    </div>


                    <p>Don't have an account? <a onClick={toggleSignup}><span className={classes.fitColor}>Sign up here!</span></a></p>
                </>
                }
                {signupState && <> <button className={`${classes.googleSignIn}`} onClick={props.onSignIn}><GoogleIcon /><span>Sign In With Google</span></button>

                    <hr className={classes.hrText} data-content="OR"></hr>


                    <div className={classes.signinItem}>
                        <Input placeholder="Email" type="email" onValidate={validateInput} onPass={emailToForm}></Input>
                    </div>
                    <div className={classes.signinItem}>
                        <Input placeholder="Password" type="password" onValidate={validateInput} onPass={emailToForm}></Input>
                    </div>
                    <div className={`${classes.signinItem} ${classes.privacyPolicy}`}>
                        <input type="checkbox"></input>
                        <div>Agree to the <a onClick={toggleSignup}><span className={classes.fitColor}>Privacy Policy</span></a></div>
                    </div>
                    <div className={classes.signinItem}>
                        <Button onClick={props.onSignIn} classes={classes.signinItem}>Sign In!</Button>
                    </div>


                    <p>Already have an account? <a onClick={toggleSignup}><span className={classes.fitColor}>Login here!</span></a></p>
                </>
                }

            </div>
        </Form >

    </>
}

export default SignIn;