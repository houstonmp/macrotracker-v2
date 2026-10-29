// The theme is saved with your data in Firebase, which only loads after sign-in. A copy
// on the device lets the first paint use it too; index.html reads the same key.
const KEY = 'fitpad-theme';

const prefersDark = () => typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const cachedTheme = () => {
    try {
        const theme = JSON.parse(localStorage.getItem(KEY));
        if (theme && theme.lightMode && theme.themeName) {
            return { themeName: theme.themeName, lightMode: theme.lightMode };
        }
    } catch (error) {
        // No storage (private window, tests): fall through to the default
    }
    return { themeName: 'teal', lightMode: prefersDark() ? 'dark' : 'light' };
}

export const cacheTheme = (theme) => {
    try {
        localStorage.setItem(KEY, JSON.stringify({ themeName: theme.themeName, lightMode: theme.lightMode }));
    } catch (error) {
        // Only costs a flash of the default theme next time
    }
}
