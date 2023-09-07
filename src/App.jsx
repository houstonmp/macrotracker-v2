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
import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";



function App() {
  const [showModal, setModal] = useState(false);
  const [isDarkTheme, toggleTheme] = useThemeDetector();

  useEffect(() => {
    console.log('Entered')
    const body = document.querySelector('body');
    if (isDarkTheme) {
      console.log('Entered dark')
      body.classList = 'dark';
    } else {
      console.log('Entered light')
      body.classList = 'light';
    }
  }, [isDarkTheme])

  const showModalHandler = () => {
    setModal(true);
  }
  const closeModalHandler = () => {
    setModal(false);
  }

  const router = createBrowserRouter([{
    path: '/',
    element: <RootLayout onTheme={toggleTheme} isDark={isDarkTheme}></RootLayout>,
    children: [
      {
        index: true,
        element: <Home showModal={showModal} onOpenModal={showModalHandler} onCloseModal={closeModalHandler}></Home>,
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
    element: <RootLayout onTheme={toggleTheme} isDark={isDarkTheme} classes="settings" />,
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
      {/* <Home></Home> */}
      <div router={router}>
        <RouterProvider router={router} />
        <Waves />
      </div >


    </>
  );
}

export default App;
