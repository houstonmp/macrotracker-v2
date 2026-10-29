import { createSlice } from '@reduxjs/toolkit';
import { cachedTheme } from '../../assets/themeCache';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        notification: null,
        modal: {
            modalIsVisible: false,
            modalInformation: null,
        },
        userPreferences: {
            // Starts from the device's copy so the app doesn't flash another theme
            theme: cachedTheme(),
            settings: {},
            user: {}
        },
        // The day the food diary is showing; null follows today, even past midnight.
        // Not saved: the app always opens on today.
        diaryDate: null,
        changed: false
    },
    reducers: {
        setDiaryDate(state, action) {
            state.diaryDate = action.payload;
        },
        replaceUiObj(state, action) {
            state.userPreferences.theme = action.payload.userPreferences.theme;
            state.userPreferences.settings = action.payload.userPreferences.settings || {};
            state.changed = action.payload.changed;
        },
        showNotification(state, action) {
            state.notification = {
                status: action.payload.status,
                title: action.payload.title,
                message: action.payload.message
            }
        },
        replaceUserObj(state, action) {
            state.userPreferences.user = action.payload;
        },
        replaceUserObjRegister(state, action) {
            state.userPreferences.user = action.payload;
            state.changed = true;
        },
        updateUser(state, action) {
            state.userPreferences.user = { ...state.userPreferences.user, ...action.payload };
            state.changed = true;
        },
        showModal(state, action) {
            state.modal.modalInformation = {
                title: action.payload.title,
                message: action.payload.message,
                componentName: action.payload.componentName,
                data: action.payload.data
            }
            state.modal.modalIsVisible = true;
        },
        closeModal(state) {
            state.modal.modalIsVisible = false;
            state.modal.modalInformation = null;
        },
        setLightMode(state, action) {
            state.userPreferences.theme.lightMode = action.payload;
            state.changed = true;
        },
        // Display choices, e.g. { weightGoalView: 'levels' }
        updateSettings(state, action) {
            state.userPreferences.settings = { ...state.userPreferences.settings, ...action.payload };
            state.changed = true;
        },
        setTheme(state, action) {
            state.userPreferences.theme.themeName = action.payload;
            state.changed = true;
        },
    }
})

export const uiActions = uiSlice.actions;
export default uiSlice;