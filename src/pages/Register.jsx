import { signInWithGoogle } from "../Firebase"
import Button from "../components/UI/Button";
import classes from "./SignIn.module.css"
import Input from "../components/UI/Input"
import { useState } from "react";
import Form from '../components/Form/Form'
import { GoogleIcon } from "../assets/Icons";
import { createUser, signinUser } from "../Firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import RadioInput from "../components/UI/RadioInput";
import { useSelector, useDispatch } from "react-redux";
import { uiActions } from "../components/store/ui-slice";
import { getAgeFromBirthday, BMRImperialMen, TDEE, MacrosByDiceSplit } from "../assets/functions";

const currentDate = new Date().getFullYear();
const Register = (props) => {
    console.log(currentDate);
    const validateBirthday = (value) => value.trim() !== '' && (currentDate - parseInt(value.split('-')[0]) > 16);
    const validateWeightGoal = (value) => {
        if (weightUnit === "lbs") {
            return value.trim() !== '' && value >= 0 && value <= 2
        } else if (weightUnit === "kgs") {
            return value.trim() !== '' && value >= 0 && value <= 0.9
        }

    };
    const validateHeight = (value) => value >= 150 && value <= 240;
    const [weightValue, setWeightGoal] = useState({});
    const [birthday, setBirthday] = useState({});
    const [heightState, setHeightUnitState] = useState('in');
    const [weightUnit, setWeightUnitState] = useState('lbs');
    const [heightCMS, setHeightCMS] = useState({});
    const navigate = useNavigate();
    const heightFeet = useRef();
    const heightInches = useRef();
    const activityLevel = useRef();
    const user = useSelector(state => state.ui.userPreferences.user)
    const dispatch = useDispatch();

    const birthdayToForm = (inputObj) => setBirthday(inputObj);
    const weightToForm = (inputObj) => setWeightGoal(inputObj);
    const heightToForm = (inputObj) => setHeightCMS(inputObj);

    let formIsValid = false;

    if (birthday.isValid && weightValue.isValid && (heightState === "cm" ? heightCMS.isValid : true)) {
        formIsValid = true;
        // console.log(formIsValid, "Birthday:", birthday.value, "Weight:", weightValue.value, "Height:", heightFeet.current.value, "\"", heightInches.current.value, "\'")
    }

    const onFormSubmitHandler = (e) => {
        if (formIsValid) {
            const birthArray = birthday.value.split("-");
            let newUserObj = {
                activityLevel: parseFloat(activityLevel.current.value),
                birthday: birthday.value,
                age: parseInt(getAgeFromBirthday(birthArray[0], birthArray[1], birthArray[2])),
                height: heightState === "in" ? {
                    in: ((parseInt(heightFeet.current.value) * 12) + parseInt(heightInches.current.value)),
                    cm: parseFloat((((heightFeet.current.value * 12) + parseInt(heightInches.current.value)) * 2.54).toFixed(2))
                } : {
                    in: parseFloat((parseInt(heightCMS.value) / 2.54).toFixed(2)),
                    cm: parseInt(heightCMS.value),
                },
                weightDeficit: weightUnit === 'lbs' ? {
                    lbs: parseFloat(weightValue.value),
                    kgs: parseFloat((weightValue.value / 2.20462).toFixed(2))
                } : {
                    kgs: parseFloat(weightValue.value),
                    lbs: parseFloat((weightValue.value * 2.20462).toFixed(2))
                }, ...user
            }

            dispatch(uiActions.replaceUserObjRegister(newUserObj))
            navigate('/')
        }
    }

    const switchRadioHeightFilter = (target) => {
        setHeightUnitState(target.value);
    }

    const switchRadioWeightFilter = (target) => {
        setWeightUnitState(target.value);
    }


    useEffect(() => {
        let authToken = sessionStorage.getItem('Auth Token')
        if (authToken && user.height && user.activityLevel && user.age && user.weightDeficit) {
            navigate('')
        }
    }, [user])



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
                                <Input label="Birthday:" type="date" onValidate={validateBirthday} onPass={birthdayToForm}></Input>
                            </div>
                            <div className={classes.signinItem}>
                                <li>
                                    {heightState === 'cm' && < Input label="How tall are you?" type="number" onValidate={validateHeight} onPass={heightToForm}></Input>}
                                    {heightState === 'in' && <>
                                        <label htmlFor="height">What is your height?</label>
                                        <div>
                                            <select id="height" ref={heightFeet} defaultValue={5}>
                                                <option value="7">7 ft</option>
                                                <option value="6">6 ft</option>
                                                <option value="5">5 ft</option>
                                            </select>
                                            <select id="height" ref={heightInches} defaultValue={0}>
                                                <option value="11">11 in</option>
                                                <option value="10">10 in</option>
                                                <option value="9">9 in</option>
                                                <option value="8">8 in</option>
                                                <option value="7">7 in</option>
                                                <option value="6">6 in</option>
                                                <option value="5">5 in</option>
                                                <option value="4">4 in</option>
                                                <option value="3">3 in</option>
                                                <option value="2">2 in</option>
                                                <option value="1">1 in</option>
                                                <option value="0">0 in</option>
                                            </select>
                                        </div>

                                    </>
                                    }
                                    <div>
                                        <RadioInput onChange={switchRadioHeightFilter} radioBtnArray={{ name: 'heightRadioFilter', value: ['in', 'cm'] }} />
                                    </div>
                                </li>
                            </div>
                            <div className={classes.signinItem}>
                                <li>
                                    <label htmlFor="activityLevel">How much do you exercise?</label>
                                    <select ref={activityLevel} id="activityLevel" defaultValue={1.2}>
                                        <option value={1.2}>Rarely {`(<1x per week)`}</option>
                                        <option value={1.375}>Sometimes {`(1~3x / week)`}</option>
                                        <option value={1.55}>Moderately {`(3~5x / week)`}</option>
                                        <option value={1.725}>Daily {`(6~7x / week)`}</option>
                                    </select>
                                </li>
                                {/* <i>* You can change this later!</i> */}
                            </div>
                            <div className={classes.signinItem}>
                                <Input label={`How much weight do you want to lose? (0 ~ ${weightUnit == 'lbs' ? '2 lbs' : '0.9 kgs'} per week)`} type="number" onValidate={validateWeightGoal} onPass={weightToForm}></Input>
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