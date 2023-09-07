import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import Waves from "../assets/Waves"
import classes from './RootLayout.module.css'
// import { HomeIcon } from "../assets/Icons"

const RootLayout = (props) => {
    return <>
        <div className={`root`}>
            <MainNav onTheme={props.onTheme} isDark={props.isDark}></MainNav>
            <main className={classes[`${props.classes}`]}>
                <Outlet />
            </main>
        </div>
    </>
}

export default RootLayout