import useInput from '../../hooks/use-input'
import classes from './Input.module.css'
import { useEffect } from 'react';

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

    let classList = `${!props.isOptional && hasError && classes.error}`;

    return <li>
        <label htmlFor={props.name}>{props.label}{props.children && <div>{props.children}</div>}</label>
        <input className={classList} id={props.id} type={props.type} name={props.name} value={value} placeholder={props.placeholder} onBlur={inputBlurHandler} onChange={inputChangeHandler}>
        </input>

        {!props.isOptional && hasError && <p className={classes['error-text']}>
            Please enter a valid {props.type === 'text' && 'text input'}
            {props.type === 'number' && 'number input'}!
        </p>}
    </li>

}

export default Input;