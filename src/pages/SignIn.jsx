import { signInWithGoogle } from "../Firebase"
import Button from "../components/UI/Button";
import classes from "./SignIn.module.css"
import Input from "../components/UI/Input"
import { useState } from "react";
import Form from '../components/Form/Form'

const SignIn = (props) => {
    const validateInput = (value) => value.trim() !== '';
    const [emailValue, setEmail] = useState({});

    const emailToForm = (inputObj) => setEmail(inputObj);

    return <Form className={classes.section} overloadFooter={true}>
        <li><h1>FitPad</h1></li>
        <li><h2>SignIn:</h2></li>
        <li>
            <Input label="Email:" type="email" onValidate={validateInput} onPass={emailToForm}></Input>
            <Button onClick={props.onSignIn}>Sign In</Button>
        </li>
        <li><Button onClick={signInWithGoogle} >Sign In with Google</Button></li>
    </Form>
}

export default SignIn;