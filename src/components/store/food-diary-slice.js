import { createSlice } from '@reduxjs/toolkit'

const foodDiarySlice = createSlice({
    name: 'fDiary',
    initialState: {
        diaryObj: []
    },
    reducers: {
        replaceDiaryObj(state, action) {
            state.diaryObj = action.payload
        },
        srchDate(state, action) {
            console.log("Reading Date", action)
            return state.diaryObj.findIndex(el => {
                return el.date === action.payload.date;
            })
        },
        updateDiary(state, action) {
            console.log(action);
            if (!state.diaryObj) {
                state.diaryObj.push({
                    date: action.payload.date,
                    food: [action.payload.data],
                })
            }
            let dateExists = state.diaryObj.findIndex(el => {
                return el.date === action.payload.date;
            })
            console.log(dateExists, "action.payload:", action.payload.data);
            if (dateExists !== -1) {
                console.log("dateExists:", dateExists, action.payload)
                state.diaryObj[dateExists].food.push(action.payload.data);
            } else {
                state.diaryObj.push({
                    date: action.payload.date,
                    food: [action.payload.data],
                })
            }
        }
    }
})

export const foodDiaryActions = foodDiarySlice.actions;
export default foodDiarySlice;