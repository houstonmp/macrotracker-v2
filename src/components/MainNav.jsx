import { NavLink } from 'react-router-dom';
import styles from './MainNav.module.css'
import { HomeIcon, DumbbellIcon, UtensilsIcon, SunIcon, MoonIcon } from '../assets/Icons';
import { useState } from 'react';
// import HomeIcon from '../assets/Icons';



const MainNav = () => {
    const [toggleButton, setToggle] = useState(false);

    const toggleButtonHandler = () => {
        setToggle(prev => {
            return !prev
        })
    }

    return <section className={styles.header}>
        <ul className={styles.list}>
            <li>
                <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')} end>
                    <HomeIcon applyFill="var(--dark-green)"></HomeIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/chart" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <DumbbellIcon applyFill="var(--dark-green)"></DumbbellIcon>
                </NavLink>
            </li>
            <li>
                <NavLink to="/entry" className={({ isActive }) => (isActive ? styles.active : '')}>
                    <UtensilsIcon applyFill="var(--dark-green)"></UtensilsIcon>
                </NavLink>
            </li>
            <li>
                <button onClick={toggleButtonHandler}>
                    {!toggleButton && <SunIcon applyFill="var(--dark-green)"></SunIcon>}
                    {toggleButton && <MoonIcon applyFill="var(--dark-green"></MoonIcon>}
                </button>
            </li>
        </ul>
    </section>
}

export default MainNav;