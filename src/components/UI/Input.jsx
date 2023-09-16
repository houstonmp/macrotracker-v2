import useInput from '../../hooks/use-input'
import classes from './Input.module.css'
import { useEffect } from 'react';

const Input = (props) => {
    const {
        value,
        isValid,
        hasError,
        inputChangeHandler,
        inputBlurHandler,
    } = useInput(props.onValidate);

    useEffect(() => {
        props.onPass({
            value,
            isValid,
            hasError
        })
    }, [isValid, hasError, value]);

    let classList = `${hasError ? classes.error : ''}`;

    return <li>
        <label htmlFor={props.name}>{props.label}<div>{props.children}</div></label>
        <input className={classList} id={props.id} type={props.type} name={props.name} value={value} onBlur={inputBlurHandler} onChange={inputChangeHandler}>
        </input>

        {hasError && <p className={classes['error-text']}>
            Please enter a valid {props.type === 'text' && 'text input'}
            {props.type === 'number' && 'number input'}!
        </p>}
    </li>

}

export default Input;