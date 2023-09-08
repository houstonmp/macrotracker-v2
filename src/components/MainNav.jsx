import { NavLink } from 'react-router-dom';
import styles from './MainNav.module.css'

import {
    HomeIcon,
    DumbbellIcon,
    UtensilsIcon,
    ChartIcon,
    CalendarIcon,
    SettingIcon,
    SunIcon,
    MoonIcon
} from '../assets/Icons';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from './store/ui-slice';



const MainNav = (props) => {
    const dispatch = useDispatch();
    const lightMode = useSelector(state => state.ui.theme.lightMode);

    const onToggleHandler = () => {
        if (lightMode === 'light') {
            dispatch(uiActions.setLightMode('dark'));
        }
        else if (lightMode === 'dark') {
            dispatch(uiActions.setLightMode('light'));
        }
    }

    return <section className={styles.header}>
        <ul className={styles.list}>
            <li>
                <NavLink to="/" alt="home" className={({ isActive }) => (isActive ? styles.active : '')} end>
                    <HomeIcon applyFill="var(--color-alpha)"></HomeIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/workout" alt="workout" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <DumbbellIcon applyFill="var(--color-alpha)"></DumbbellIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/food" alt="home" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <UtensilsIcon applyFill="var(--color-alpha)"></UtensilsIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/insights" alt="insights" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <ChartIcon applyFill="var(--color-alpha)"></ChartIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/calendar" alt="calendar" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <CalendarIcon applyFill="var(--color-alpha)"></CalendarIcon>
                </NavLink>
            </li>
            <li>
                <button onClick={onToggleHandler}>
                    {!lightMode && <SunIcon applyFill="var(--color-alpha)"></SunIcon>}
                    {lightMode && <MoonIcon applyFill="var(--color-alpha"></MoonIcon>}
                </button>
            </li>
            <li>
                <NavLink to="/settings" alt="calendar" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <SettingIcon applyFill="var(--color-alpha)"></SettingIcon>
                </NavLink>
            </li>
        </ul>
    </section>
}

export default MainNav;