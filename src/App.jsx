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

import { useSelector } from 'react-redux'




function App() {
  const isModal = useSelector(state => state.ui.modal.modalIsVisible);
  const isDark = useSelector(state => state.ui.theme.isDark)

  useEffect(() => {
    const body = document.querySelector('body');
    if (isDark) {
      body.classList = 'dark';
    } else {
      body.classList = 'light';
    }
  }, [isDark])

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
        <Waves />
        {isModal && <Modal></Modal>}
      </div>
    </>
  );
}

export default App;
