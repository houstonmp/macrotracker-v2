import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"

const RootLayout = () => {

    return <>

        <div className={`root`}>

            <MainNav></MainNav>
            <main>
                <Outlet />
            </main>

        </div>

    </>
}

export default RootLayout