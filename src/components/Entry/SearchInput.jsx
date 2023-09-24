import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import formClasses from '../Form/Form.module.css'
import inputClasses from '../UI/Input.module.css'

import Input from "../UI/Input";

const SearchInput = (props) => {
    const [searchValue, setSearchValue] = useState('');

    const onChangeHandler = (e) => {
        setSearchValue(e.target.value)
    }
    useEffect(() => {
        const timeout = setTimeout(() => {
            props.onSearch(searchValue);
        }, 300);
        return () => {
            clearTimeout(timeout)
        }
    }, [searchValue])

    return <div className={formClasses.form}>
        <ul>
            <label htmlFor="search">{props.label}</label>
            <input id="search" name="search" type="text" onChange={onChangeHandler} value={searchValue} />
        </ul>
    </div>
}

export default SearchInput;