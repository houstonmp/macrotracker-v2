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
import RadioInput from "../components/UI/RadioInput";

const Register = (props) => {
    const validatePassword = (value) => value.trim() !== '';
    const validateEmail = (value) => value.trim() !== '' && value.includes('@');
    const [emailValue, setEmail] = useState({});
    const [passwordValue, setPassword] = useState({});
    const [signupState, setSignup] = useState(true);
    const [radioState, setFilterState] = useState('in');
    const [weightUnit, setWeightUnitState] = useState('lbs')
    const navigate = useNavigate();

    const emailToForm = (inputObj) => setEmail(inputObj);
    const passwordToForm = (inputObj) => setPassword(inputObj);

    let formIsValid = false;

    if (emailValue.isValid && passwordValue.isValid) {
        formIsValid = true;
    }

    const onFormSubmitHandler = (e) => {
        if (formIsValid && signupState) {
            createUser(emailValue.value, passwordValue.value);
        } else if (formIsValid && !signupState) {
            signinUser(emailValue.value, passwordValue.value);
        }
    }

    const toggleSignup = () => {
        setSignup(prev => !prev);
    }
    const switchRadioFilter = (target) => {
        setFilterState(target.value);
    }

    const switchRadioWeightFilter = (target) => {
        setWeightUnitState(target.value);
    }


    useEffect(() => {
        let authToken = sessionStorage.getItem('Auth Token')
        if (authToken) {
            navigate('')
        }
    }, [])

    return <>
        <div className="signInScreen">
            <div className={classes.register}>
                <Form className={classes.section} overloadFooter={true} onFormSubmit={onFormSubmitHandler}>
                    {/* <SignInBG classes={classes.signInBg} /> */}
                    <div className={classes.signInContainer}>
                        <div className={classes.signinItem}><h1><span className={classes.fitColor}>Fit</span>Pad</h1></div>
                        {/* <i>We just need a few things to  get started!</i> */}
                        <hr className={classes.hrText} data-content="Let's get started!"></hr>
                        <section className={classes.section}>
                            <div className={classes.signinItem}>
                                <Input label="Birthday:" type="date" onValidate={validatePassword} onPass={passwordToForm}></Input>
                            </div>
                            <div className={classes.signinItem}>
                                <li>
                                    {radioState === 'cm' && < Input label="How tall are you?" type="value" onValidate={validatePassword} onPass={passwordToForm}></Input>}
                                    {radioState === 'in' && <>
                                        <label htmlFor="height">What is your height?</label>
                                        <div>
                                            <select id="height">
                                                <option>7 ft</option>
                                                <option>6 ft</option>
                                                <option>5 ft</option>
                                            </select>
                                            <select id="height">
                                                <option>11 in</option>
                                                <option>10 in</option>
                                                <option>9 in</option>
                                                <option>8 in</option>
                                                <option>7 in</option>
                                                <option>6 in</option>
                                                <option>5 in</option>
                                                <option>4 in</option>
                                                <option>3 in</option>
                                                <option>2 in</option>
                                                <option>1 in</option>
                                                <option>0 in</option>
                                            </select>
                                        </div>

                                    </>
                                    }
                                    <div>
                                        <RadioInput onChange={switchRadioFilter} radioBtnArray={{ name: 'heightRadioFilter', value: ['in', 'cm'] }} />
                                    </div>
                                </li>
                            </div>
                            <div className={classes.signinItem}>
                                <li>
                                    <label htmlFor="activityLevel">How much do you exercise?</label>
                                    <select id="activityLevel">
                                        <option>Rarely {`(<1x per week)`}</option>
                                        <option>Sometimes {`(1~3x / week)`}</option>
                                        <option>Moderately {`(3~5x / week)`}</option>
                                        <option>Daily {`(6~7x / week)`}</option>
                                    </select>
                                </li>
                                {/* <i>* You can change this later!</i> */}
                            </div>
                            <div className={classes.signinItem}>
                                <Input label="How much weight do you want to lose? (0 ~ 2 lbs per week)" type="number" onValidate={validatePassword} onPass={passwordToForm}></Input>
                                <RadioInput onChange={switchRadioWeightFilter} radioBtnArray={{ name: 'weightRadioFilter', value: ['lbs', 'kgs'] }} />
                            </div>
                        </section>
                        <Button type="submit" classes={classes.button} disable={!formIsValid}>Finish!</Button>
                    </div>
                </Form >
            </div >
        </div >
    </>
}

export default Register;