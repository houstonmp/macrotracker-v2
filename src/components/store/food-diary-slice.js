import { createSlice } from '@reduxjs/toolkit'
import { sumMacros } from '../../assets/food';

const dayMacros = (day) => sumMacros(day.food.map(entry => entry.macros));
const emptyDay = (date) => ({ date, food: [], water: [], macros: sumMacros([]) });

// A day stays while it has any food or water logged, or is marked untracked
const removeIfEmpty = (state, dayIndex) => {
    const day = state.diaryObj[dayIndex];
    if (day.food.length === 0 && day.water.length === 0 && !day.untracked) {
        state.diaryObj.splice(dayIndex, 1);
    }
}

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
                state.diaryObj.push({ ...emptyDay(date), food: [entry], macros: entry.macros });
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
            day.macros = dayMacros(day);
            removeIfEmpty(state, dayIndex);
            state.changed = true;
        },
        // entry: { id, ml, kind: 'cup' | 'exact', label }
        addWater(state, action) {
            const { date, entry } = action.payload;
            let day = state.diaryObj.find(el => el.date === date);
            if (!day) {
                state.diaryObj.push(emptyDay(date));
                day = state.diaryObj[state.diaryObj.length - 1];
            }
            day.water.push(entry);
            state.changed = true;
        },
        // An untracked day is one you chose not to count: averages leave it out
        // rather than treating it as a day of very little food
        setUntracked(state, action) {
            const { date, untracked } = action.payload;
            let dayIndex = state.diaryObj.findIndex(el => el.date === date);
            if (dayIndex === -1) {
                state.diaryObj.push(emptyDay(date));
                dayIndex = state.diaryObj.length - 1;
            }
            const day = state.diaryObj[dayIndex];
            if (untracked) {
                day.untracked = true;
            } else {
                delete day.untracked;
            }
            removeIfEmpty(state, dayIndex);
            state.changed = true;
        },
        removeWater(state, action) {
            const dayIndex = state.diaryObj.findIndex(el => el.date === action.payload.date);
            if (dayIndex === -1) {
                return;
            }
            const day = state.diaryObj[dayIndex];
            day.water = day.water.filter(entry => entry.id !== action.payload.id);
            removeIfEmpty(state, dayIndex);
            state.changed = true;
        }
    }
})

export const foodDiaryActions = foodDiarySlice.actions;
export default foodDiarySlice;
