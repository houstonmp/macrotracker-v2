import PageContent from "../components/PageContent"
import Modal from '../components/UI/Modal'

const Home = (props) => {
    
  let modalContent = (
    <>
      <h1>Modal</h1>
      <section>
        <p>This is some content.</p>
      </section>
    </>
  )

    return <PageContent title="Home">
        <p>This is some content</p>
        <button onClick={props.onOpenModal}>Toggle</button>
        {props.showModal && <Modal onClose={props.onCloseModal}>{modalContent}</Modal>}
    </PageContent>
}

export default Home;