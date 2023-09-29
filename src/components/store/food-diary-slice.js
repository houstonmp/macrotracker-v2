import { createSlice } from '@reduxjs/toolkit'

const foodDiarySlice = createSlice({
    name: 'fDiary',
    initialState: {
        diaryObj: [],
        changed: false
    },
    reducers: {
        replaceDiaryObj(state, action) {
            state.diaryObj = action.payload;
        },
        srchDate(state, action) {
            return state.diaryObj.findIndex(el => {
                return el.date === action.payload.date;
            })
        },
        updateDiary(state, action) {
            if (!state.diaryObj) {
                state.diaryObj.push({
                    date: action.payload.date,
                    food: [action.payload.data],
                    macros: {
                        calories: action.payload.data.calories,
                        tProtein: action.payload.data.tProtein,
                        tFat: action.payload.data.tFat,
                        tCarbs: action.payload.data.tCarbs,
                    }
                })
                state.changed = true;
                return;
            }
            let dateExists = state.diaryObj.findIndex(el => {
                return el.date === action.payload.date;
            })
            if (dateExists > -1) {
                state.diaryObj[dateExists].food.push(action.payload.data);
                state.diaryObj[dateExists].macros.calories = parseFloat((state.diaryObj[dateExists].macros.calories + action.payload.data.calories).toFixed(2));
                state.diaryObj[dateExists].macros.tCarbs = parseFloat((state.diaryObj[dateExists].macros.tCarbs + action.payload.data.tCarbs).toFixed(2));
                state.diaryObj[dateExists].macros.tProtein = parseFloat((state.diaryObj[dateExists].macros.tProtein + action.payload.data.tProtein).toFixed(2));
                state.diaryObj[dateExists].macros.tFat = parseFloat((state.diaryObj[dateExists].macros.tFat + action.payload.data.tFat).toFixed(2));
                state.changed = true;
                return;
            } else {
                state.diaryObj.push({
                    date: action.payload.date,
                    food: [action.payload.data],
                    macros: {
                        calories: action.payload.data.calories,
                        tProtein: action.payload.data.tProtein,
                        tFat: action.payload.data.tFat,
                        tCarbs: action.payload.data.tCarbs,
                    }
                })
                state.changed = true;
                return;
            }
        }
    }
})

export const foodDiaryActions = foodDiarySlice.actions;
export default foodDiarySlice;