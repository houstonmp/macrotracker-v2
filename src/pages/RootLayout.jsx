import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import { useState } from "react"
import SignIn from "./SignIn";
import classes from "./SignIn.module.css"

const RootLayout = () => {
    // const = useSelector(state => state.ui.userInfo);
    const [isSignedIn, setSignedIn] = useState(false);

    const onSignInHandler = () => {
        setSignedIn(true);
    }

    return <>

        <div className={`root`}>
            {isSignedIn ?
                <>
                    <MainNav></MainNav>
                    <main>
                        <Outlet />
                    </main>
                </>

                : <>
                    <main className={classes.signin}>
                        <SignIn onSignIn={onSignInHandler} />
                    </main>
                </>
            }


        </div>

    </>
}

export default RootLayout