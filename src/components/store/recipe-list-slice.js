import { createSlice } from "@reduxjs/toolkit";

const recipeListSlice = createSlice({
    name: 'recipes',
    initialState: {
        recipeObj: {
            recipes: [],
            items: [],
            meals: []
        }
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
        },
        updateItem(state, action) {
            console.log(action)
            if (!(state.recipeObj.items.length > 0)) {
                state.recipeObj.items.push(action.payload)
            }
            // let itemExists = state.recipeObj.items.findIndex(el => {
            //     return el.name === action.payload.name;
            // })
            // if (itemExists > -1) {
            //     state.recipeObj.items[itemExists]
            // }
            else {
                state.recipeObj.items.push(action.payload)
            }
        }
    }
})

export const recipeListActions = recipeListSlice.actions;
export default recipeListSlice;