import PageContent from "../components/PageContent"
import Button from '../components/UI/Button'
import Modal from "../components/UI/Modal"
import Card from "../components/UI/Card"
import EntryCard from "../components/EntryCard"
import classes from "./Entry.module.css"

const Entry = (props) => {

    let modalContent = (
        <>
            <h1>Modal</h1>
            <section>
                <p>This is some content.</p>
            </section>
        </>
    )

    return <>
        <div classes={classes.check}>
            <EntryCard onModal={props.onOpenModal} />
            <Card classes='.checkData'>

            </Card>
        </div>
        <Card classes={classes.calorieTracker}>

        </Card>
        {props.showModal && <Modal onClose={props.onCloseModal}>{modalContent}</Modal>}
    </>
    // <PageContent title="Entry">

    // <Button onClick={props.onOpenModal}>Toggle</Button>

    // </PageContent>
}

export default Entry;