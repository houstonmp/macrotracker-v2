import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        notification: null,
        modal: {
            modalIsVisible: false,
            modalInformation: null,
        },
        userPreferences: {
            theme: {
                themeName: 'teal',
                lightMode: 'light'
            },

        },
        changed: false
    },
    reducers: {
        replaceUiObj(state, action) {
            state.userPreferences.theme = action.payload.userPreferences.theme;
            state.userPreferences.settings = action.payload.userPreferences.settings;
            state.changed = action.payload.changed;
        },
        showNotification(state, action) {
            state.notification = {
                status: action.payload.status,
                title: action.payload.title,
                message: action.payload.message
            }
        },
        showModal(state, action) {
            state.modal.modalInformation = {
                title: action.payload.title,
                message: action.payload.message,
                componentName: action.payload.componentName
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
        setTheme(state, action) {
            state.userPreferences.theme.themeName = action.payload;
            state.changed = true;
        },
    }
})

export const uiActions = uiSlice.actions;
export default uiSlice;