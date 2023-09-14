import { configureStore } from "@reduxjs/toolkit";

import uiSlice from './ui-slice'
import weightSlice from "./weight-slice";

const store = configureStore({
    reducer: { ui: uiSlice.reducer, weight: weightSlice.reducer }
})

export default store;