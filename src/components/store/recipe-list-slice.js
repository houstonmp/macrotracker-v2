import { createSlice } from "@reduxjs/toolkit";

const recipeListSlice = createSlice({
    name: 'recipes',
    initialState: {
        recipeObj: {
            recipes: [],
            items: [],
            meals: []
        },
        changed: false
    },
    reducers: {
        replaceRecipeObj(state, action) {
            state.recipeObj = action.payload.recipeObj
            state.changed = action.payload.changed
        },
        updateRecipe(state, action) {
            let recipeArray = '';
            if (action.payload.type === "RECIPE") {
                recipeArray = 'recipes';
            }
            else if (action.payload.type === "ITEM") {
                recipeArray = 'items';
            } else if (action.payload.type === 'MEAL') {
                recipeArray = 'meals';
            } else {
                return;
            }

            if (state.recipeObj[recipeArray].length > 0) {
                state.recipeObj[recipeArray].push(action.payload.data)
                state.changed = true;
            }
            else {
                state.recipeObj[recipeArray] = [action.payload.data];
                state.changed = true;
            }
        }
    }
})

export const recipeListActions = recipeListSlice.actions;
export default recipeListSlice;