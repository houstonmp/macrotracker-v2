import { Outlet, useNavigate } from "react-router-dom"
import MainNav from "../components/MainNav"
import { useState } from "react"
import SignIn from "./SignIn";
import classes from "./SignIn.module.css"
import { auth, signInWithGoogle } from "../Firebase";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice";

import { fetchData } from "../components/store/fetch-slice";
import { getAdditionalUserInfo, getRedirectResult } from "firebase/auth";

let isInitial = true;

const RootLayout = () => {
    const user = useSelector(state => state.ui.userPreferences.user);
    const ui = useSelector(state => state.ui);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (isInitial) {

    //     } else {
    //         setSignedIn(false)
    //     }
    // }, [user])



    return <>

        <div className={`root`}>
            {/* {ui.isSignedIn ? */}
            <>
                <MainNav></MainNav>
                <main>
                    <Outlet />
                </main>
            </>

            {/* : <>
                    <main className={classes.signin}>
                        <SignIn onSignIn={onSignInHandler} />
                    </main>
                </>
            } */}


        </div>

    </>
}

export default RootLayout