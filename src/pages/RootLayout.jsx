import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import { useState } from "react"
import SignIn from "./SignIn";
import classes from "./SignIn.module.css"
import { auth, signInWithGoogle } from "../Firebase";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uiActions } from "../components/store/ui-slice";
import { weightActions } from "../components/store/weight-slice";
import { foodDiaryActions } from "../components/store/food-diary-slice";
import { recipeListActions } from "../components/store/recipe-list-slice";
import { fetchData } from "../components/store/fetch-slice";
import { getAdditionalUserInfo, getRedirectResult } from "firebase/auth";

let isInitial = true;

const RootLayout = () => {
    const [isSignedIn, setSignedIn] = useState(false);
    const user = useSelector(state => state.ui.userPreferences.user);
    const dispatch = useDispatch();

    const onSignInHandler = () => {
        signInWithGoogle().then(() => {
        }).catch(error => console.log(error))
    }

    useEffect(() => {
        if (isInitial) {
            if (user.uid) {
                dispatch(fetchData({
                    url: 'users/' + user.uid + '/healthApp.json?auth=',
                    saveData: (data) => {
                        data.userPreferences && dispatch(uiActions.replaceUiObj({ userPreferences: data.userPreferences || {}, changed: false }))
                        data.weightObj && dispatch(weightActions.replaceWeightObj({ weightObj: data.weightObj || [], changed: false }))
                        data.diaryObj && dispatch(foodDiaryActions.replaceDiaryObj({ diaryObj: data.diaryObj || [], changed: false }))
                        data.recipeObj && dispatch(recipeListActions.replaceRecipeObj({
                            recipeObj: {
                                items: data.recipeObj.items || [],
                                meals: data.recipeObj.meals || [],
                                recipes: data.recipeObj.recipes || []
                            } || {}, changed: false
                        }))
                    },
                    header: {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                }));

                isInitial = false;
                return;
            }
        } else {
            setSignedIn(false)
        }
    }, [user])

    useEffect(() => {
        auth.onAuthStateChanged(async (userAuth) => {
            if (userAuth) {
                const userData = {
                    uid: userAuth.uid,
                    imgURL: userAuth.photoURL,
                    email: userAuth.email,
                    name: userAuth.displayName,
                }
                // const redirectResult = await getRedirectResult(auth)
                // if (redirectResult) {
                //     try {
                //         const details = getAdditionalUserInfo(redirectResult)
                //         const isNewUser = details.isNewUser;
                //         userData.initialize = isNewUser;
                //     } catch (error) {
                //         console.log(error)
                //     }
                // }
                dispatch(uiActions.replaceUserObj(userData));
                setSignedIn(true)
            } else {
                setSignedIn(false)
            }
        }
        )
    }, [auth])

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