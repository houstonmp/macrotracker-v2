import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import formClasses from '../Form/Form.module.css'
import inputClasses from './SearchInput.module.css'

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

    return <li>
        <input className={inputClasses.input} id="search" name="search" type="text" onChange={onChangeHandler} placeholder={props.label} value={searchValue} />
    </li>
}

export default SearchInput;