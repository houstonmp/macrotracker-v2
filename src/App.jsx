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

// import MainNav from './components/MainNav'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { AnimatedSwitch } from "react-router-transition";

import { useDispatch, useSelector } from 'react-redux'
// import { weightActions } from "./components/store/weight-slice";
import { fetchSlice } from "./components/store/fetch-slice";

import { foodDiaryActions } from "./components/store/food-diary-slice";
import { weightActions } from "./components/store/weight-slice";
import { uiActions } from "./components/store/ui-slice";
import { recipeListActions } from "./components/store/recipe-list-slice";
import SignIn from './pages/SignIn'


let isInitial = true;

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



  const router = createBrowserRouter([
    {
      index: '/',
      element: <RootLayout></RootLayout>,
      children: [{
        index: true,
        element: <Home></Home>
      },
      {
        path: 'workout',
        element: <Workout></Workout>,
      },
      {
        path: 'food',
        element: <Entry></Entry>,
      },
      {
        path: 'insights',
        element: <Insights></Insights>,
      },
      {
        path: 'calendar',
        element: <Calendar></Calendar>,
      }, {
        path: 'settings',
        element: <Settings></Settings>,
      }]
    },
  ])


  return (
    <>
      <div router={router}>
        <RouterProvider router={router} />
        <Waves />
        {isModal && <Modal></Modal>}
      </div>
    </>
  );
}

export default App;
