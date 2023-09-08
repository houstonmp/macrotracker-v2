import { useDispatch } from "react-redux";
import { uiActions } from "./ui-slice";

const setThemeDetector = () => {
    const dispatch = useDispatch();
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


    dispatch(uiActions.setIsDark(isDarkTheme));
}

export default setThemeDetector;