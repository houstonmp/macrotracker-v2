import { useState } from "react";
import Modal from './components/UI/Modal'
import RootLayout from "./pages/RootLayout";
import Home from './pages/Home';
import Workout from './pages/Workout';
import Entry from './pages/Entry';
import Waves from "./assets/Waves";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";

// import MainNav from './components/MainNav'
import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";

function App() {
  const [showModal, setModal] = useState(false);

  const showModalHandler = () => {
    setModal(true);
  }
  const closeModalHandler = () => {
    setModal(false);
  }

  const router = createBrowserRouter([{
    path: '/',
    element: <RootLayout></RootLayout>,
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
  }])


  return (
    <>
      {/* <Home></Home> */}
      <div router={router}>
        <RouterProvider router={router} />
        <Waves />
      </div>


    </>
  );
}

export default App;
