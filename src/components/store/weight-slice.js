import { createSlice } from '@reduxjs/toolkit';

const weightSlice = createSlice({
    name: 'weight',
    initialState: {
        weightObj: []
    },
    reducers: {
        replaceWeightObj(state, action) {
            state.weightObj = action.payload;
        },
        srchDate(state, action) {
            return state.weightObj.findIndex((el) => {
                return el.date.toJSON().slice(0, 10) === action.date.toJSON().slice(0, 10);
            })
        },
        updateWeight(state, action) {
            if (state.weightObj) {
                state.weightObj.push(action.payload)
            }
            let dateExists = state.reducers.srchDate(action.date);
            if (dateExists) {
                state.weightObj[dateExists] = action.payload;
            } else if (!dateExists) {
                state.weightObj.push(action.payload);
            }
        }
    }
})

export const weightActions = weightSlice.actions;

export default weightSlice;