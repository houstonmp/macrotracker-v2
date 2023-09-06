import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import Waves from "../assets/Waves"
// import { HomeIcon } from "../assets/Icons"

const RootLayout = () => {
    return <>
        <div className="root">
            <MainNav></MainNav>
            <main>
                <Outlet />
            </main>
        </div>
    </>
}

export default RootLayout