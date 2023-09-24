import { useState } from "react";

import Form from "../Form/Form";
import Input from "../UI/Input";

const SearchInput = () => {
    const validateInput = (value) => value.trim() !== '';
    // const dispatch = useDispatch();
    let formIsValid = false;

    const [nameState, setName] = useState({});
    const nameToForm = (inputObj) => setName(inputObj);

    if (nameState.isValid) {
        formIsValid = true;
    }

    const searchFormHandler = () => {
        if (formIsValid) {
            console.log("Form Submitted");
            return true;
        }
        return false;
    };


    return <Form onFormSubmit={searchFormHandler} formIsValid={formIsValid} submitText="Search">
        <Input id="rName" key="rName" name="recipeName" type="text" label="Food Name:" onPass={nameToForm} onValidate={validateInput} />
    </Form>
}

export default SearchInput;