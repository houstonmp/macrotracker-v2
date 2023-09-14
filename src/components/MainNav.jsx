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
    const settingsIsVisible = useSelector(state => state.ui.settings.settingsIsVisible);

    const onToggleHandler = () => {
        if (lightMode === 'light') {
            dispatch(uiActions.setLightMode('dark'));
        }
        else if (lightMode === 'dark') {
            dispatch(uiActions.setLightMode('light'));
        }
    }
    const onToggleSettingsHandler = () => {
        console.log(settingsIsVisible)
        dispatch(uiActions.toggleSettings());
    }

    let settingsHREF = settingsIsVisible ? '/settings' : '..';
    console.log(settingsHREF);

    return <section className={styles.header}>

        <ul className={styles.list}>
            <li>
                <NavLink to="/" title="Home" className={({ isActive }) => (isActive ? styles.active : '')} end>
                    <HomeIcon applyFill="var(--color-alpha)"></HomeIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/workout" title="Workout" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <DumbbellIcon applyFill="var(--color-alpha)"></DumbbellIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/food" title="Food" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <UtensilsIcon applyFill="var(--color-alpha)"></UtensilsIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/insights" title="Insights" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <ChartIcon applyFill="var(--color-alpha)"></ChartIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/calendar" title="Calendar" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <CalendarIcon applyFill="var(--color-alpha)"></CalendarIcon>
                </NavLink>
            </li>
            <li>
                <button onClick={onToggleHandler} className={styles['light-mode']}>
                    {lightMode === 'light' && <SunIcon applyFill="var(--color-alpha)"></SunIcon>}
                    {lightMode === 'dark' && <MoonIcon applyFill="var(--primary-gold-500)"></MoonIcon>}
                </button>
            </li>
            <li>
                <button onClick={onToggleSettingsHandler} className={`settings ${settingsIsVisible && styles['active']}`}>
                    <SettingIcon applyFill="var(--color-alpha)"></SettingIcon>
                </button>
                {/* <NavLink to={settingsHREF} onClick={onToggleSettingsHandler} alt="settings" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <SettingIcon applyFill="var(--color-alpha)"></SettingIcon>
                </NavLink> */}
            </li>
        </ul>
    </section >
}

export default MainNav;