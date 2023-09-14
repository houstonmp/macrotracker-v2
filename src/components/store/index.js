import { configureStore } from "@reduxjs/toolkit";

import uiSlice from './ui-slice';
import weightSlice from "./weight-slice";
import foodDiarySlice from "./food-diary-slice"

const store = configureStore({
    reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer, fDiary: foodDiarySlice.reducer }
})

export default store;