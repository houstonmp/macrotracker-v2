import useInput from '../../hooks/use-input'
import classes from './Input.module.css'
import { useEffect } from 'react';

const ERRORS = {
    text: 'Fill this in',
    number: 'Enter a number',
    date: 'Pick a date',
    password: 'Enter a password',
    email: 'Enter a valid email',
};

const Input = (props) => {
    const {
        id,
        value,
        isValid,
        hasError,
        inputChangeHandler,
        inputBlurHandler,
    } = useInput(props.onValidate, props.defaultValue, props.id);

    useEffect(() => {
        props.onPass({
            id,
            value,
            isValid,
            hasError
        })
    }, [isValid, hasError, value]);

    const showError = !props.isOptional && hasError;
    const classList = `${classes.input} ${showError ? classes.error : ''}`;

    return <li>
        <label htmlFor={props.id}>{props.label}{props.note && <span className={classes.note}>{props.note}</span>}{props.children && <div>{props.children}</div>}</label>
        <input className={classList} id={props.id} type={props.type} name={props.name} value={value} placeholder={props.placeholder} onBlur={inputBlurHandler} onChange={inputChangeHandler}
            aria-invalid={showError}>
        </input>

        {showError && <p className={classes['error-text']}>{ERRORS[props.type] || 'Fill this in'}</p>}
    </li>

}

export default Input;