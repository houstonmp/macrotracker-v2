import { createSlice } from "@reduxjs/toolkit";

const recipeList = createSlice({
    name: 'recipes',
    initialState: {
        recipeObj: [],
        ingredients: [],
    }
})