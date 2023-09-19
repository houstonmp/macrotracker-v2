import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        notification: null,
        modal: {
            modalIsVisible: false,
            modalInformation: null,
        },
        theme: {
            themeName: 'teal',
            lightMode: 'light'
            // lightMode: setThemeDetector()
        },
        settings: {
            settingsIsVisible: false
        }
    },
    reducers: {
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
            state.theme.lightMode = action.payload;
        },
        setTheme(state, action) {
            state.theme.themeName = action.payload;
        },
        toggleSettings(state, action) {
            state.settings.settingsIsVisible = !state.settings.settingsIsVisible;
        }
    }
})

export const uiActions = uiSlice.actions;
export default uiSlice;