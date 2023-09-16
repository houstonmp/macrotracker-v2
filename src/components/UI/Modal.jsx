import styles from './Modal.module.css';
import ReactDOM from 'react-dom';
import Card from './Card';
import Form from '../Form/Form'

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../store/ui-slice';

//Form Components
import { RecipeForm } from '../Entry/EntryCard';
import { WorkoutForm } from '../Weight/WeightEntry';

const Backdrop = props => {
    const dispatch = useDispatch();

    const closeModalHandler = (e) => {
        if (e.currentTarget === e.target) {
            dispatch(uiActions.closeModal())
        }
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
            modalData = <WorkoutForm></WorkoutForm>
            break;
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