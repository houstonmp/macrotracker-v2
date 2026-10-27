import { createSlice } from '@reduxjs/toolkit';
import { LBS_PER_KG } from '../../assets/functions';

const weightSlice = createSlice({
    name: 'weight',
    initialState: {
        weightObj: [],
        changed: false
    },
    reducers: {
        replaceWeightObj(state, action) {
            state.weightObj = action.payload.weightObj;
            state.changed = action.payload.changed;
        },
        sortDates(state) {
            state.weightObj.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });
        },
        updateWeight(state, action) {
            const switchWeightUnit = () => {
                const wght = Number(action.payload.value);
                if (action.payload.unit === "kgs") {
                    return { kgs: wght, lbs: Number((wght * LBS_PER_KG).toFixed(2)) };
                }
                else if (action.payload.unit === "lbs") {
                    return { kgs: Number((wght / LBS_PER_KG).toFixed(2)), lbs: wght };
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
            state.changed = true;

        },
        removeWeight(state, action) {
            state.weightObj = state.weightObj.filter(el => el.date !== action.payload.date);
            state.changed = true;
        }
    }
})

export const weightActions = weightSlice.actions;

export default weightSlice;