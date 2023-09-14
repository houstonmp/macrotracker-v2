import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import { useSelector } from "react-redux"

const RootLayout = (props) => {

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