import { createSlice } from "@reduxjs/toolkit";

const LISTS = ['items', 'recipes', 'meals'];

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
        addEntry(state, action) {
            if (!LISTS.includes(action.payload.list)) {
                return;
            }
            state.recipeObj[action.payload.list].push(action.payload.data);
            state.changed = true;
        },
        removeEntry(state, action) {
            const { list, id } = action.payload;
            if (!LISTS.includes(list)) {
                return;
            }
            state.recipeObj[list] = state.recipeObj[list].filter(el => el.id !== id);
            state.changed = true;
        }
    }
})

export const recipeListActions = recipeListSlice.actions;
export default recipeListSlice;
