import { NavLink } from 'react-router-dom';
import styles from './MainNav.module.css'
import { HomeIcon, DumbbellIcon, UtensilsIcon } from '../assets/Icons';
// import HomeIcon from '../assets/Icons';

const MainNav = () => {
    return <section className={styles.header}>
        <ul className={styles.list}>
            <li>
                <NavLink to="/">
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
        </ul>
    </section>
}

export default MainNav;