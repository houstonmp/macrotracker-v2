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

import { useSelector } from 'react-redux'




function App() {
  const isModal = useSelector(state => state.ui.modal.modalIsVisible);
  const { lightMode, themeName } = useSelector(state => { return state.ui.theme });

  useEffect(() => {
    const body = document.querySelector('body');
    body.classList = `${lightMode} ${themeName}`
  }, [lightMode, themeName])

  const router = createBrowserRouter([{
    path: '/',
    element: <RootLayout></RootLayout>,
    children: [
      {
        index: true,
        element: <Home></Home>,
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
      }
    ]
  },
  {
    path: '/settings',
    element: <RootLayout classes="settings" />,
    children: [
      {
        index: true,
        element: <Settings />
      },
    ]
  }



  ])


  return (
    <>
      <div router={router}>

        <RouterProvider router={router} />
        {/* <AnimatedSwitch
          atEnter={{ opacity: 0 }}
          atLeave={{ opacity: 0 }}
          atActive={{ opacity: 1 }}
          className="switch-wrapper"
        > */}
        <Waves />
        {isModal && <Modal></Modal>}
        {/* </AnimatedSwitch> */}
      </div>
    </>
  );
}

export default App;
