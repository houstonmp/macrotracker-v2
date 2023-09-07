import { useState, useEffect, useCallback } from 'react'


const useThemeDetector = () => {
    const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());

    const toggleTheme = useCallback((value) => {
        setIsDarkTheme(prev => {
            if (prev !== value) {
                return value;
            }
        })
    }, []);


    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDarkTheme(darkThemeMq.matches);
    }, []);
    return [isDarkTheme, toggleTheme];
}

export default useThemeDetector;