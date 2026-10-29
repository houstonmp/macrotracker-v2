import Modal from './components/UI/Modal'
import RootLayout from "./pages/RootLayout";
import Home from './pages/Home';
import Workout from './pages/Workout';
import Entry from './pages/Entry';
import Waves from "./assets/Waves";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";
import Settings from "./pages/settings/Settings"
import { useEffect, useState } from 'react'
import { auth } from "./Firebase";
import { useNavigate } from "react-router-dom";

import { Routes, Route } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux'
import { fetchSlice, fetchData } from "./components/store/fetch-slice";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import { uiActions } from "./components/store/ui-slice";
import { weightActions } from "./components/store/weight-slice";
import { foodDiaryActions } from "./components/store/food-diary-slice";
import { recipeListActions } from "./components/store/recipe-list-slice";
import { migrateDiaryObj, migrateRecipeObj } from "./assets/food";
import { cacheTheme } from "./assets/themeCache";
import LoadingScreen from "./components/UI/LoadingScreen";
import useBikeRides from "./components/Exercise/useBikeRides";

// Pages you can be on while signed out
const SIGNED_OUT_PAGES = ['/signin', '/register'];


function App() {
  const isModal = useSelector(state => state.ui.modal.modalIsVisible);
  const { lightMode, themeName } = useSelector(state => { return state.ui.userPreferences.theme });
  const user = useSelector(state => { return state.ui.userPreferences.user });
  const weightSelector = useSelector(state => state.weight);
  const diarySelector = useSelector(state => state.fDiary);
  const uiSelector = useSelector(state => state.ui);
  const recipeSelector = useSelector(state => state.recipes)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 'auth' until Firebase has restored any saved sign-in from the device, then 'loading'
  // while your data comes down. Nothing else shows until then, so there's no sign-in
  // page flash and nothing can save an empty app over your data.
  const [startup, setStartup] = useState('auth');
  const [attempt, setAttempt] = useState(0);
  useBikeRides(startup === 'ready');

  useEffect(() => {
    return auth.onAuthStateChanged((userAuth) => {
      try {
        if (userAuth) {
          sessionStorage.setItem('Auth Token', userAuth.accessToken)
          setStartup('loading');

          dispatch(fetchData({
            onError: () => setStartup('error'),
            url: 'users/' + userAuth.uid + '/healthApp.json?auth=',
            saveData: (data) => {
              try {
                data.userPreferences && dispatch(uiActions.replaceUiObj({ userPreferences: data.userPreferences || {}, changed: false }))
                data.weightObj && dispatch(weightActions.replaceWeightObj({ weightObj: data.weightObj || [], changed: false }))
                data.diaryObj && dispatch(foodDiaryActions.replaceDiaryObj({ diaryObj: migrateDiaryObj(data.diaryObj), changed: false }))
                data.recipeObj && dispatch(recipeListActions.replaceRecipeObj({ recipeObj: migrateRecipeObj(data.recipeObj), changed: false }))
              } catch (error) {
                console.log("Failed to login:", error.message)
              }



              const savedUser = { ...(data && data.userPreferences && data.userPreferences.user) };
              // These used to be stored; selectDailyTargets derives them now
              ['BMR', 'TDEEValue', 'dailyMacros', 'age'].forEach(key => delete savedUser[key]);

              dispatch(uiActions.replaceUserObj({
                ...savedUser,
                uid: userAuth.uid,
                imgURL: userAuth.photoURL,
                email: userAuth.email,
                name: userAuth.displayName,
              }));

              if (!savedUser.height || !savedUser.activityLevel || !savedUser.birthday || !savedUser.weightDeficit) {
                navigate('/register');
              } else if (SIGNED_OUT_PAGES.includes(window.location.pathname)) {
                navigate('');
              }
              // Otherwise stay put, so a refresh on Insights stays on Insights
              setStartup('ready');
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
          setStartup('signedOut');
          if (!SIGNED_OUT_PAGES.includes(window.location.pathname)) {
            navigate('/signin');
          }
        }
      } catch (error) {
        console.log("Error", error.message)
      }

    }
    )
  }, [attempt])



  useEffect(() => {
    const body = document.querySelector('body');
    body.classList = `${lightMode} ${themeName}`
    cacheTheme({ lightMode, themeName });
  }, [lightMode, themeName])

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

  if (startup === 'auth' || startup === 'loading' || startup === 'error') {
    return <LoadingScreen failed={startup === 'error'} onRetry={() => {
      setStartup('auth');
      setAttempt(attempt + 1);
    }} />
  }

  return (
    <>
      <div className="App">
        <>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
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
