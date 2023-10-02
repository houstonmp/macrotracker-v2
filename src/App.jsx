import { useState } from "react";
import Modal from './components/UI/Modal'
import RootLayout from "./pages/RootLayout";
import Home from './pages/Home';
import Workout from './pages/Workout';
import Entry from './pages/Entry';
import Waves from "./assets/Waves";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";
import Settings from "./pages/settings/Settings"
import { useEffect } from 'react'
import useThemeDetector from "./hooks/use-theme";
import { signInWithGoogle, auth } from "./Firebase";
import { useNavigate } from "react-router-dom";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux'
import { fetchSlice, fetchData } from "./components/store/fetch-slice";
import SignIn from "./pages/SignIn";
import { uiActions } from "./components/store/ui-slice";
import { weightActions } from "./components/store/weight-slice";
import { foodDiaryActions } from "./components/store/food-diary-slice";
import { recipeListActions } from "./components/store/recipe-list-slice";
import { getAdditionalUserInfo } from "firebase/auth";
import { BMRImperialMen, TDEE, MacrosByDiceSplit } from "./assets/functions";


function App() {
  const isModal = useSelector(state => state.ui.modal.modalIsVisible);
  const { lightMode, themeName } = useSelector(state => { return state.ui.userPreferences.theme });
  const user = useSelector(state => { return state.ui.userPreferences.user });
  const weightSelector = useSelector(state => state.weight);
  const diarySelector = useSelector(state => state.fDiary);
  const uiSelector = useSelector(state => state.ui);
  const recipeSelector = useSelector(state => state.recipes)
  const notification = useSelector(state => state.ui.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();



  useEffect(() => {
    auth.onAuthStateChanged((userAuth) => {
      try {
        if (userAuth) {
          sessionStorage.setItem('Auth Token', userAuth.accessToken)
          // let isNewUser = getAdditionalUserInfo(userAuth);

          const userData = {
            uid: userAuth.uid,
            imgURL: userAuth.photoURL,
            email: userAuth.email,
            name: userAuth.displayName,
            // isNewUser: isNewUser,
            activityLevel: 1.2,
            age: 28,
            height: {
              cm: 177.8,
              in: 70
            }
            // initialize: true
          }
          // console.log(isNewUser);
          dispatch(fetchData({
            url: 'users/' + userAuth.uid + '/healthApp.json?auth=',
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


          let BMR = BMRImperialMen(201.9, userData.height.in, userData.age);
          console.log(BMR)
          let TDEEValue = TDEE(userData.activityLevel, BMR);
          console.log(TDEEValue)
          let dailyMacros = MacrosByDiceSplit(TDEEValue, 85);

          userData.BMR = BMR;
          userData.TDEEValue = TDEEValue;
          userData.dailyMacros = dailyMacros;

          navigate('');
          dispatch(uiActions.replaceUserObj(userData));
        } else {
          sessionStorage.removeItem("Auth Token");
        }
      } catch (error) {
        console.log("Error", error.message)
      }

    }
    )
  }, [auth])



  const onSignInHandler = () => {
    signInWithGoogle().then((response) => {
      // console.log("Response", response)
    }).catch(error => console.log(error))
  }

  useEffect(() => {
    const body = document.querySelector('body');
    body.classList = `${lightMode} ${themeName}`
  }, [uiSelector.userPreferences])

  useEffect(() => {
    if ((weightSelector.changed || diarySelector.changed || uiSelector.changed || recipeSelector.changed) && user.uid) {
      dispatch(fetchSlice({
        url: 'users/' + user.uid + '/healthApp.json?auth=',
        header: {
          method: 'PUT',
          body: JSON.stringify({
            diaryObj: diarySelector.diaryObj,
            weightObj: weightSelector.weightObj,
            userPreferences: uiSelector.userPreferences,
            recipeObj: recipeSelector.recipeObj
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }));
    }
  }, [weightSelector.weightObj, diarySelector.diaryObj, uiSelector.userPreferences.theme, recipeSelector.recipeObj, dispatch]);



  // const router = createBrowserRouter([
  //   {
  //     index: '/',
  //     element: <RootLayout></RootLayout>,
  //     children: [{
  //       index: true,
  //       element: <Home></Home>,
  //       loader: async () => {
  //         try {
  //           if (!user.uid) {
  //             return redirect('/login')
  //           } else {

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

  //         } catch (error) {
  //           console.log(error.message)
  //         }

  //       }
  //     },
  //     {
  //       path: 'workout',
  //       element: <Workout></Workout>,
  //     },
  //     {
  //       path: 'food',
  //       element: <Entry></Entry>,
  //     },
  //     {
  //       path: 'insights',
  //       element: <Insights></Insights>,
  //     },
  //     {
  //       path: 'calendar',
  //       element: <Calendar></Calendar>,
  //     },
  //     {
  //       path: 'settings',
  //       element: <Settings></Settings>,
  //     },
  //     ]
  //   },
  //   {
  //     path: '/login',
  //     element: <SignIn onSignIn={onSignInHandler} />,
  //     loader: () => {
  //       if (user.uid) {
  //         return redirect('')
  //       }
  //       return null;
  //     }
  //   }
  // ])
  useEffect(() => {
    let authToken = sessionStorage.getItem('Auth Token')
    console.log("Auth", authToken)
    if (authToken) {
      navigate('')
    }
    if (!authToken) {
      navigate('/signin')
    }
  }, [])

  return (
    <>
      <div className="App">
        <>
          <Routes>
            <Route path="/signin" element={<SignIn onSignIn={onSignInHandler} />} />
            {/* <Route path="/register" element={<Register />}></Route> */}
            <Route path="" element={<RootLayout />}>
              <Route path="" element={<Home />} />
              <Route path="workout" element={<Workout />} />
              <Route path="insights" element={<Insights />} />
              <Route path="food" element={<Entry />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </>
      </div>
      <Waves />
      {isModal && <Modal></Modal>}
    </>
  );
}

export default App;
