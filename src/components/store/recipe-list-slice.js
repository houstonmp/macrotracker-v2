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
            let recipeArray = '';
            if (action.payload.type === "RECIPE") {
                // recipeArray = action.type;               
                recipeArray = 'recipes';
            }
            else if (action.payload.type === "ITEM") {
                recipeArray = 'items';
            } else if (recipeArray === 'MEAL') {
                recipeArray = 'meals';
            } else {
                return;
            }

            if (!(state.recipeObj.items.length > 0)) {
                state.recipeObj[recipeArray].push(action.payload.data)
            }
            // let itemExists = state.recipeObj.items.findIndex(el => {
            //     return el.name === action.payload.name;
            // })
            // if (itemExists > -1) {
            //     state.recipeObj.items[itemExists]
            // }
            else {
                state.recipeObj[recipeArray].items.push(action.payload.data)
            }
        }
    }
})

export const recipeListActions = recipeListSlice.actions;
export default recipeListSlice;