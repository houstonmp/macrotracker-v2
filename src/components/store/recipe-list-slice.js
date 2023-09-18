import { createSlice } from "@reduxjs/toolkit";

const recipeList = createSlice({
    name: 'recipes',
    initialState: {
        recipeObj: [],
        ingredients: [],
    },
    reducers: {
        replaceRecipeObj(state, action) {
            state.recipeObj = action.payload
        },
        updateRecipe(state, action) {
            if (!(state.recipeObj.length > 0)) {
                state.recipeObj.push({
                    macros: [action.payload.data],
                })
            }
            let recipeExists = state.recipeObj.findIndex(el => {
                return el.name === action.payload.name;
            })
            if (dateExists > -1) {
                state.recipeObj[recipeExists].ingredients.push(action.payload.data);
            } else {
                state.recipeObj.push({
                    name: action.payload.name,
                    macros: [action.payload.data],
                })
            }
        }
    }
})