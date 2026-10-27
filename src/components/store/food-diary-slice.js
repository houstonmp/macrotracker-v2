import { createSlice } from '@reduxjs/toolkit'
import { sumMacros } from '../../assets/food';

const dayMacros = (day) => sumMacros(day.food.map(entry => entry.macros));

const foodDiarySlice = createSlice({
    name: 'fDiary',
    initialState: {
        diaryObj: [],
        changed: false
    },
    reducers: {
        replaceDiaryObj(state, action) {
            state.diaryObj = action.payload.diaryObj;
            state.changed = false;
        },
        addFood(state, action) {
            const { date, entry } = action.payload;
            const day = state.diaryObj.find(el => el.date === date);
            if (day) {
                day.food.push(entry);
                day.macros = dayMacros(day);
            } else {
                state.diaryObj.push({ date, food: [entry], macros: entry.macros });
            }
            state.changed = true;
        },
        removeFood(state, action) {
            const dayIndex = state.diaryObj.findIndex(el => el.date === action.payload.date);
            if (dayIndex === -1) {
                return;
            }
            const day = state.diaryObj[dayIndex];
            day.food = day.food.filter(entry => entry.id !== action.payload.id);

            // Recalculate from what's left rather than subtracting, so rounding can't drift
            if (day.food.length === 0) {
                state.diaryObj.splice(dayIndex, 1);
            } else {
                day.macros = dayMacros(day);
            }
            state.changed = true;
        }
    }
})

export const foodDiaryActions = foodDiarySlice.actions;
export default foodDiarySlice;
