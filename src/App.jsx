import { useState } from "react";
import Modal from './components/UI/Modal'
import RootLayout from "./pages/RootLayout";
import Home from './pages/Home';
import Chart from './pages/Chart';
import Entry from './pages/Entry';

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
        path: 'chart',
        element: <Chart></Chart>,
      },
      {
        path: 'entry',
        element: <Entry></Entry>,
      }
    ]
  }])

  let modalContent = (
    <>
      <h1>Modal</h1>
      <section>
        <p>This is some content.</p>
      </section>
    </>
  )

  return (
    <>
      {/* <Home></Home> */}
      <div router={router}>
        <RouterProvider router={router}/>
      </div>


    </>
  );
}

export default App;
