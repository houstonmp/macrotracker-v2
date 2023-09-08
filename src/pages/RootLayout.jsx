import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import classes from './RootLayout.module.css'
// import { HomeIcon } from "../assets/Icons"

const RootLayout = (props) => {
    return <>
        <div className={`root`}>
            <MainNav></MainNav>
            <main className={classes[`${props.classes}`]}>
                <Outlet />
            </main>
        </div>
    </>
}

export default RootLayout