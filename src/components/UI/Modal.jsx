import styles from './Modal.module.css';
import ReactDOM from 'react-dom';
import Card from './Card';

import { ItemForm } from '../Entry/EntryCard/EntryCard';

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../store/ui-slice';

//Form Components
import { RecipeForm } from '../Entry/EntryCard/EntryCard';
import { WeightForm } from '../Weight/WeightEntry';

const Backdrop = props => {
    const dispatch = useDispatch();

    const closeModalHandler = (e) => {
        if (e.currentTarget === e.target) {
            dispatch(uiActions.closeModal())
        }
    }

    return <div onMouseDown={closeModalHandler} className={styles.backdrop}>
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
            modalData = <ItemForm></ItemForm>;
            break;
        case 'workout':
            modalData = <WeightForm></WeightForm>
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
    </>
}

export default Modal;