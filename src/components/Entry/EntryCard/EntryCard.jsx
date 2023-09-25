import Card from '../../UI/Card'
import Button from '../../UI/Button';
import classes from './EntryCard.module.css'
import Form from '../../Form/Form'
import Table from "../../UI/Table";
import { useDispatch } from 'react-redux';
import { foodDiaryActions } from '../../store/food-diary-slice';
import Input from '../../UI/Input';
import useInput from '../../../hooks/use-input';
import { useState, useEffect } from 'react';
import SearchInput from '../../UI/SearchInput';
import { uiActions } from '../../store/ui-slice';
import MacroData from './MacroData';
import IngredientData from './IngredientData'


//Recipe Form - Passed to Modal as a Component
export const RecipeForm = () => {
    const validateInput = (value) => value.trim() !== '';
    const dispatch = useDispatch();
    // const dispatch = useDispatch();
    let formIsValid = false;

    const [nameState, setName] = useState({});
    const [proteinState, setProtein] = useState({});
    const [carbsState, setCarbs] = useState({});
    const [fatState, setFat] = useState({});

    const nameToForm = (inputObj) => setName(inputObj);
    const proteinToForm = (inputObj) => setProtein(inputObj);
    const carbsToForm = (inputObj) => setCarbs(inputObj);
    const fatToForm = (inputObj) => setFat(inputObj);

    if (nameState.isValid && proteinState.isValid && carbsState.isValid && fatState.isValid) {
        formIsValid = true;
    }

    const onCancelHandler = (e) => {
        e.preventDefault();
        dispatch(uiActions.closeModal());
    }



    const recipeFormHandler = () => {
        if (formIsValid) {
            console.log("Form Submitted");
            return true;
        }
        return false;
    };

    return <Form onFormSubmit={recipeFormHandler} formIsValid={formIsValid} submitText="Submit">
        <Input id="rName" key="rName" name="recipeName" type="text" label="Food Name:" onPass={nameToForm} onValidate={validateInput} />
        <Input id="pValue" key="pValue" name="proteinValue" type="number" label="Protein (g):" onPass={proteinToForm} onValidate={validateInput} />
        <Input id="cValue" key="cValue" name="carbValue" type="number" label="Carbs (g):" onPass={carbsToForm} onValidate={validateInput} />
        <Input id="fValue" key="fValue" name="fatValue" type="number" label="Fat (g):" onPass={fatToForm} onValidate={validateInput} />
    </Form>
}

const EntryCard = (props) => {
    const dispatch = useDispatch();
    const [navState, setNavState] = useState('recipeCard');

    const onClickHandler = (e) => {
        const index = e.currentTarget.id;
        dispatch(foodDiaryActions.updateDiary({
            type: "UPDATE",
            date: new Date().toJSON().slice(0, 10),
            data: props.foodItems[index]
        })
        )
    }

    const onNavChangeHandler = (e) => {
        setNavState(e.currentTarget.id)
    }


    return <Card classes={classes.recipe} >
        <header className={classes.header}>
            <a id="recipeCard" className={navState === 'recipeCard' ? classes.active : ''} onClick={onNavChangeHandler}><h3>Recipes</h3></a>
            <a id="itemCard" className={navState === 'itemCard' ? classes.active : ''} onClick={onNavChangeHandler}><h3>Items</h3></a>
            <a id="mealCard" className={navState === 'mealCard' ? classes.active : ''} onClick={onNavChangeHandler}><h3>Mealplan</h3></a>
        </header>
        <article className={classes.article}>
            <SearchInput onSearch={props.onFilter} label="Filter Name" />
            {/* <FilterInput /> */}
            {/* <MacroData tableData={props.foodItems} onClickHandler={onClickHandler} /> */}
            <IngredientData tableData={props.foodItems} onClickHandler={onClickHandler} />

            <footer className={classes.footer}>
                <Button name='recipe' onClick={props.onModal}>+ Create Item</Button>
                {/* <Button name='item' onClick={props.onModal}>+ Search</Button> */}
            </footer>
        </article>

    </Card >
}

export default EntryCard;