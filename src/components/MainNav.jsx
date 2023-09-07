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
import { useState } from 'react';
import useThemeDetector from '../hooks/use-theme';
// import HomeIcon from '../assets/Icons';



const MainNav = (props) => {
    const onToggleHandler = () => {
        props.onTheme(!props.isDark);
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
                    {!props.isDark && <SunIcon applyFill="var(--color-alpha)"></SunIcon>}
                    {props.isDark && <MoonIcon applyFill="var(--color-alpha"></MoonIcon>}
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