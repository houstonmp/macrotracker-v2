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



  useEffect(() => {
    auth.onAuthStateChanged((userAuth) => {
      try {
        if (userAuth) {
          sessionStorage.setItem('Auth Token', userAuth.accessToken)

          dispatch(fetchData({
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
              } else {
                navigate('');
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
