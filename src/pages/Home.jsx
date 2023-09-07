import { useEffect } from 'react';
import PageContent from "../components/PageContent"
import Modal from '../components/UI/Modal'
import useThemeDetector from "../hooks/use-theme"
import Button from '../components/UI/Button'

const Home = (props) => {
  const isDarkTheme = useThemeDetector();


  let modalContent = (
    <>
      <h1>Modal</h1>
      <section>
        <p>This is some content.</p>
      </section>
    </>
  )

  return <PageContent title="Home">
    {/* <Button onClick={props.onOpenModal}>Toggle</Button>
    {props.showModal && <Modal onClose={props.onCloseModal}>{modalContent}</Modal>} */}
  </PageContent>
}

export default Home;