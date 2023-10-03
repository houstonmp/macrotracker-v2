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
import { signInWithGoogle, auth } from "./Firebase";
import { useNavigate } from "react-router-dom";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux'
import { fetchSlice, fetchData } from "./components/store/fetch-slice";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import { uiActions } from "./components/store/ui-slice";
import { weightActions } from "./components/store/weight-slice";
import { foodDiaryActions } from "./components/store/food-diary-slice";
import { recipeListActions } from "./components/store/recipe-list-slice";
import { BMRImperialMen, TDEE, MacrosByDiceSplit, getAgeFromBirthday } from "./assets/functions";


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

          const userData = {
            uid: userAuth.uid,
            imgURL: userAuth.photoURL,
            email: userAuth.email,
            name: userAuth.displayName,
          }
          dispatch(fetchData({
            url: 'users/' + userAuth.uid + '/healthApp.json?auth=',
            saveData: (data) => {
              try {
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
              } catch (error) {
                console.log(error.message)
              }



              if (!data || !data.userPreferences.user.height || !data.userPreferences.user.activityLevel || !data.userPreferences.user.age || !data.userPreferences.user.birthday) {
                dispatch(uiActions.replaceUserObj(userData));
                navigate('/register');
              } else {
                try {
                  const birthArray = data.userPreferences.user.birthday.split("-");
                  let AGE = parseInt(getAgeFromBirthday(birthArray[0], birthArray[1], birthArray[2]));
                  if (data.weightObj) {
                    let BMR = BMRImperialMen(201.9, data.userPreferences.user.height.in, AGE);
                    let TDEEValue = TDEE(data.userPreferences.user.activityLevel, BMR);
                    let dailyMacros = MacrosByDiceSplit(TDEEValue, (data.userPreferences.user.weightDeficit.lbs * 3500 / 7));

                    userData.BMR = BMR;
                    userData.TDEEValue = TDEEValue;
                    userData.dailyMacros = dailyMacros;
                  }

                  userData.birthday = data.userPreferences.user.birthday;
                  userData.age = AGE;
                  userData.height = data.userPreferences.user.height;
                  userData.activityLevel = data.userPreferences.user.activityLevel;
                  userData.weightDeficit = data.userPreferences.user.weightDeficit;

                  console.log(userData);

                  dispatch(uiActions.replaceUserObj(userData));
                  navigate('');

                } catch (error) {
                  console.log(error.code, error.message)
                }

              }
            },
            header: {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          }));


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
  }, [weightSelector.weightObj, diarySelector.diaryObj, uiSelector.userPreferences, recipeSelector.recipeObj, dispatch]);

  useEffect(() => {
    let authToken = sessionStorage.getItem('Auth Token')
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
            <Route path="/register" element={<Register />}></Route>
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
