import { useState, useEffect } from "react";
import inputClasses from './SearchInput.module.css'

const SearchInput = (props) => {
    const [searchValue, setSearchValue] = useState('');

    const onChangeHandler = (e) => {
        setSearchValue(e.target.value)
    }
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchValue) {
                props.onSearch(searchValue);
            }
        }, 300);
        return () => {
            clearTimeout(timeout)
        }
    }, [searchValue])

    return <li>
        <input className={inputClasses.input} list={props.list} name="search" type="text" onChange={onChangeHandler} placeholder={props.label} value={searchValue} />
    </li>
}

export default SearchInput;