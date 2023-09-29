import { useState } from 'react';

const useInput = (validateValue, defaultValue, inputId) => {
    const [enteredValue, setEnteredValue] = useState(defaultValue ? defaultValue : '');
    const [isTouched, setIsTouched] = useState(false);
    const [id, setId] = useState(inputId ? inputId : '');

    const valueIsValid = validateValue(enteredValue);
    const hasError = !valueIsValid && isTouched;

    const inputChangeHandler = (event) => {
        setEnteredValue(event.target.value);
    }

    const inputBlurHandler = () => {
        setIsTouched(true);
    }
    const reset = () => {
        setEnteredValue('');
        setIsTouched(false);
    }

    return {
        id,
        value: enteredValue,
        isValid: valueIsValid,
        hasError: hasError,
        inputChangeHandler,
        inputBlurHandler,
        reset
    };
}

export default useInput;