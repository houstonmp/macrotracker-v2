import Card from '../../UI/Card'
import Button from '../../UI/Button';
import classes from './EntryCard.module.css'
import Form from '../../Form/Form'
import { useDispatch } from 'react-redux';
import { foodDiaryActions } from '../../store/food-diary-slice';
import Input from '../../UI/Input';
import { useState, useEffect } from 'react';
import SearchInput from '../../UI/SearchInput';
import MacroData from './MacroData';
import IngredientData from './IngredientData'
import RadioInput from '../../UI/RadioInput';
import formClasses from "../../Form/Form.module.css"
import { recipeListActions } from '../../store/recipe-list-slice';


import InputRecipeData from './InputRecipeData';

export const RecipeForm = () => {
    const [nameState, setName] = useState({});
    const dispatch = useDispatch();
    let formIsValid = false;
    const [ingList, setIngList] = useState([]);
    const nameToForm = (inputObj) => setName(inputObj);

    if (nameState.isValid) {
        formIsValid = true;
    }

    const itemFormHandler = (e) => {
        if (formIsValid && ingList.length > 0) {
            dispatch(recipeListActions.updateRecipe({
                type: "RECIPE",
                data: {
                    id: nameState.value,
                    name: nameState.value,
                    ingredients: ingList
                }
            }));
            return true;
        }
        return false;
    };


    const onAddItemHandler = (listItem) => {
        if (!ingList.some(el => el.fdcId == listItem.fdcId)) {
            setIngList(prev => {
                let newArray = [listItem, ...prev];
                return newArray;
            })
        }
    }
    const onDeleteIngHandler = (e) => {
        setIngList(prev => {
            let index = prev.findIndex(el => el.fdcId == e.target.id);
            return index ? prev.toSpliced(index - 1, 1) : prev;
        })
    }

    return <Form onFormSubmit={itemFormHandler} formIsValid={formIsValid} submitText="Submit">
        <InputRecipeData ingList={ingList} nameToForm={nameToForm} onDelete={onDeleteIngHandler} onAdd={onAddItemHandler} />
    </Form>
}

//Recipe Form - Passed to Modal as a Component
export const ItemForm = () => {
    const validateInput = (value) => value.trim() !== '';
    const dispatch = useDispatch();
    let formIsValid = false;

    const [nameState, setName] = useState({});
    const [proteinState, setProtein] = useState({});
    const [carbsState, setCarbs] = useState({});
    const [fatState, setFat] = useState({});
    const [ingState, setIngredients] = useState({});

    const nameToForm = (inputObj) => setName(inputObj);
    const proteinToForm = (inputObj) => setProtein(inputObj);
    const carbsToForm = (inputObj) => setCarbs(inputObj);
    const fatToForm = (inputObj) => setFat(inputObj);
    const ingToForm = (inputObj) => setIngredients(inputObj);

    if (nameState.isValid && proteinState.isValid && carbsState.isValid && fatState.isValid) {
        formIsValid = true;
    }

    const itemFormHandler = () => {
        if (formIsValid) {
            dispatch(recipeListActions.updateRecipe({
                type: "ITEM",
                data: {
                    id: nameState.value,
                    name: nameState.value,
                    calories: ((proteinState.value * 4) + (fatState.value * 9) + (carbsState.value * 4)),
                    tCarbs: +carbsState.value,
                    tFat: +fatState.value,
                    tProtein: +proteinState.value,
                    ingredients: ingState.value.split(',')
                }
            }
            ));
            return true;
        }
        return false;
    };

    return <Form onFormSubmit={itemFormHandler} formIsValid={formIsValid} submitText="Submit">
        <Input id="rName" key="rName" name="recipeName" type="text" label="Food Name:" onPass={nameToForm} onValidate={validateInput} isOptional={false} placeholder="Protein Bar" />
        <Input id="pValue" key="pValue" name="proteinValue" type="number" label="Protein (g):" onPass={proteinToForm} onValidate={validateInput} isOptional={false} placeholder="(6)" />
        <Input id="cValue" key="cValue" name="carbValue" type="number" label="Carbs (g):" onPass={carbsToForm} onValidate={validateInput} isOptional={false} placeholder="(15)" />
        <Input id="fValue" key="fValue" name="fatValue" type="number" label="Fat (g):" onPass={fatToForm} onValidate={validateInput} isOptional={false} placeholder="(16)" />
        <Input id="ingValue" key="ingValue" name="ingValue" type="text" label="Ingredients List: (Optional)" onPass={ingToForm} onValidate={validateInput} isOptional={true} placeholder="Almonds, Chicory, root fiber, honey, palm kernel oil, sugar, glucose syrup, rice flour... (Optional)" />
    </Form>
}

const EntryCard = (props) => {
    const dispatch = useDispatch();
    const [navState, setNavState] = useState('recipes');
    const [filterState, setFilterState] = useState('Macros');
    const [foodItems, setFoodItems] = useState(props.foodItems[navState]);

    useEffect(() => {
        setFoodItems(props.foodItems[navState])
    }, [navState, props.foodItems])


    const onClickHandler = (e) => {
        const index = e.currentTarget.id;
        dispatch(foodDiaryActions.updateDiary({
            type: "UPDATE",
            date: new Date().toJSON().slice(0, 10),
            data: props.foodItems[navState][index]
        })
        )
    }

    const onFilterHandler = (value) => {
        const filterValue = value.toLowerCase();
        const newArray = props.foodItems[navState].filter((el) => {
            return el.name.toLowerCase().includes(filterValue);
        })
        setFoodItems(newArray);
    }

    const onNavChangeHandler = (e) => {
        setNavState(e.currentTarget.id)
    }

    const switchRadioFilter = (target) => {
        setFilterState(target.value);
    }

    return <Card classes={classes.recipe} >
        <header className={classes.header}>
            <a id="recipes" className={navState === 'recipes' ? classes.active : ''} onClick={onNavChangeHandler}><h3>Recipes</h3></a>
            <a id="items" className={navState === 'items' ? classes.active : ''} onClick={onNavChangeHandler}><h3>Items</h3></a>
            <a id="meals" className={navState === 'meals' ? classes.active : ''} onClick={onNavChangeHandler}><h3>Mealplan</h3></a>
        </header>
        <article className={classes.article}>
            {navState === 'recipes' && <i>Select or create a new recipe!</i>}
            {navState === 'items' && <i>Select or add an individual item or ingredient!</i>}
            {navState === 'meals' && <i>This weeks meals!</i>}

            <div className={formClasses.form}>
                <ul>
                    <SearchInput onSearch={onFilterHandler} label="Filter Name" />
                    <RadioInput onChange={switchRadioFilter} radioBtnArray={{ name: 'recipeRadioFilter', value: ['Macros', 'Ingredients'] }} />
                </ul>
            </div>

            {/* <FilterInput /> */}
            {filterState === 'Macros' && 0 < foodItems.length && <MacroData navName={navState} tableData={foodItems} onClickHandler={onClickHandler} />}
            {filterState === 'Ingredients' && 0 < foodItems.length && <IngredientData navName={navState} tableData={foodItems} onClickHandler={onClickHandler} />}
            {foodItems.length === 0 && <p>Click 'Create {navState}' to get started!</p>}

            <footer className={classes.footer}>
                <Button name='recipe' onClick={props.onModal}>+ Create Recipe</Button>
                <Button name='item' onClick={props.onModal}>+ Create Item</Button>
            </footer>
        </article>

    </Card >
}

export default EntryCard;