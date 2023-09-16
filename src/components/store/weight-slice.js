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
                return el.date === action.payload.date;
            })
        },
        sortDates(state) {
            state = state.weightObj.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });
        },
        updateWeight(state, action) {
            const switchWeightUnit = () => {
                if (action.payload.unit === "kgs") {
                    let wght = action.payload.value;
                    let kgs = wght;
                    let lbs = Number((wght * 2.2).toFixed(2));
                    return { kgs, lbs };
                }
                else if (action.payload.unit === "lbs") {
                    let wght = action.payload.value;
                    let kgs = Number((wght / 2.2).toFixed(2));
                    let lbs = wght;
                    return { kgs, lbs };
                }
            }

            const weight = switchWeightUnit();

            if (!state.weightObj) {
                state.weightObj.push({
                    date: action.payload.date,
                    kgs: weight.kgs,
                    lbs: weight.lbs
                })
            }
            let dateExists = state.weightObj.findIndex(el => {
                return el.date === action.payload.date;
            })
            if (dateExists > -1) {
                state.weightObj[dateExists].kgs = weight.kgs;
                state.weightObj[dateExists].lbs = weight.lbs;
            } else {
                state.weightObj.push({
                    date: action.payload.date,
                    kgs: weight.kgs,
                    lbs: weight.lbs
                })
            }
        }
    }
})

export const weightActions = weightSlice.actions;

export default weightSlice;