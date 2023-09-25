import React from "react";
import { useState } from "react";
import inputClasses from '../UI/Input.module.css'

const RadioInput = (props) => {
    const [radioState, setRadio] = useState(props.radioBtnArray.value[0]);
    const onChangeHandler = (e) => {
        setRadio(e.target.value);
        props.onChange && props.onChange(e.target);
    }

    return <li className={inputClasses.radio}>
        {props.radioBtnArray.value.map((el, index) => {
            return <React.Fragment key={`radio-list-${el}-${index}`}>
                <label key={'label-' + el + index} htmlFor={el}>{el}</label>
                <input key={'input-' + el + index} type="radio" name={props.radioBtnArray.name} value={el} checked={radioState === el} onChange={onChangeHandler} />
            </React.Fragment>
        })}
    </li>
}

export default RadioInput;