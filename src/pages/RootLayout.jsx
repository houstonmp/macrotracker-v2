import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import classes from './RootLayout.module.css'
import { useSelector } from "react-redux"
import Settings from "./settings/Settings"
// import { HomeIcon } from "../assets/Icons"

const RootLayout = (props) => {
    const settingsIsVisible = useSelector(state => state.ui.settings.settingsIsVisible)

    return <>

        <div className={`root`}>

            <MainNav></MainNav>
            {settingsIsVisible && <Settings></Settings>}
            <main>
                <Outlet />
            </main>

        </div>

    </>
}

export default RootLayout