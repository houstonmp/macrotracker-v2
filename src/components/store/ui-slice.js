import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        modal: {
            modalIsVisible: false,
            modalInformation: null,
        },
        theme: {
            themeName: 'default',
            isDark: false
            // isDark: setThemeDetector()
        }
    },
    reducers: {
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
        setIsDark(state, action) {
            state.theme.isDark = action.payload;
        },
        setTheme(state, action) {
            state.theme.themeName = action.payload;
        }
    }
})

export const uiActions = uiSlice.actions;
export default uiSlice;