import styles from './Modal.module.css';
import ReactDOM from 'react-dom';
import Card from './Card';
import Form from '../Form/Form'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../store/ui-slice';

//Form Components
import { RecipeForm } from '../Entry/EntryCard';

const Backdrop = props => {
    const dispatch = useDispatch();

    const closeModalHandler = () => {
        dispatch(uiActions.closeModal())
    }

    return <div onClick={closeModalHandler} className={styles.backdrop}>
        {props.children}
    </div>
}

const ModalOverlay = () => {
    const modalObj = useSelector(state => state.ui.modal.modalInformation);

    let modalData = null;

    switch (modalObj.componentName) {
        case 'recipe':
            modalData = <RecipeForm></RecipeForm>;
            break;
        case 'item':
            modalData = (<Form>
                <li>
                    <label htmlFor="i1" />
                    <input type="text" required />
                </li>
            </Form>);
            break;
        case 'workout':
            modalData = (<Form>
                <li>
                    <label htmlFor="w1" />
                    <input type="text" required />
                    <label htmlFor="kg" />
                    <input type="radio" name="kg" require />
                    <label htmlFor="kg" />
                    <input type="radio" name="lbs" require />
                </li>
            </Form>)
        default:
            modalData = <p>Sorry nothing to show at this time...</p>
    }

    return <Card classes={styles.modal}>
        <h1>{modalObj.title}</h1>
        <div className={styles.content}>
            {modalObj.message && <p>{modalData.message}</p>}
            {modalObj.componentName && modalData}
        </div>
    </Card>
}

const portalElement = document.getElementById('overlays');

const Modal = (props) => {
    return <>
        {ReactDOM.createPortal(<Backdrop><ModalOverlay /></Backdrop>, portalElement)}
        {/* {ReactDOM.createPortal(<ModalOverlay></ModalOverlay>, portalElement)} */}
    </>
}

export default Modal;