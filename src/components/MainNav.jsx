import { NavLink } from 'react-router-dom';
import styles from './MainNav.module.css'

const MainNav = () => {
    return  <section className={styles.header}>
            <ul className={styles.list}>
                <li>
                    <NavLink to="/" className={({isActive})=>(isActive ? styles.active : '')} end>
                    <h3>Home</h3>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/chart" className={({isActive})=>(isActive ? styles.active : '')}>
                        <h3>Chart</h3>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/entry" className={({isActive})=>(isActive ? styles.active : '')}>
                        <h3>Entry</h3>
                    </NavLink>
                </li>
            </ul>
            </section>
}

export default MainNav;