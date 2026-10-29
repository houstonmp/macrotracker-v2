import styles from './Modal.module.css';
import ReactDOM from 'react-dom';
import { useEffect } from 'react';
import Card from './Card';

import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../store/ui-slice';

//Form Components
import PantryForm from '../Entry/EntryCard/PantryForm';
import BuilderForm from '../Entry/EntryCard/BuilderForm';
import LogForm from '../Entry/EntryCard/LogForm';
import QuickEstimate from '../Entry/EntryCard/QuickEstimate';
import { WeightForm } from '../Weight/WeightEntry';
import MealieImport from '../../extensions/mealie/MealieImport';

// Forms with a lot side by side get a wider card on desktop
const WIDE = ['mealie-import'];

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
    const dispatch = useDispatch();
    const modalObj = useSelector(state => state.ui.modal.modalInformation);

    const onCloseHandler = () => {
        dispatch(uiActions.closeModal());
    }

    useEffect(() => {
        const onKeyDown = (e) => e.key === 'Escape' && dispatch(uiActions.closeModal());
        document.addEventListener('keydown', onKeyDown);
        // Keep the page behind from scrolling along with the modal
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = overflow;
        }
    }, [dispatch]);

    let modalData = null;

    switch (modalObj.componentName) {
        case 'recipe':
            modalData = <BuilderForm kind="recipe" />;
            break;
        case 'meal':
            modalData = <BuilderForm kind="meal" />;
            break;
        case 'item':
            modalData = <PantryForm />;
            break;
        case 'log':
            modalData = <LogForm list={modalObj.data.list} entry={modalObj.data.entry} />;
            break;
        case 'workout':
            modalData = <WeightForm></WeightForm>
            break;
        case 'quick-estimate':
            modalData = <QuickEstimate preset={modalObj.data && modalObj.data.preset} />;
            break;
        case 'mealie-import':
            modalData = <MealieImport />;
            break;
        default:
            modalData = <p>Sorry nothing to show at this time...</p>
    }

    return <Card classes={`${styles.modal} ${WIDE.includes(modalObj.componentName) ? styles.wide : ''}`}>
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={styles.dialog}>
            <header className={styles.header}>
                <h2 id="modal-title">{modalObj.title}</h2>
                <button type="button" className={styles.close} onClick={onCloseHandler} aria-label="Close" title="Close">✕</button>
            </header>
            {/* Scrolls on its own so the title and the form's buttons stay in view */}
            <div className={styles.body}>
                {modalObj.message && <p>{modalObj.message}</p>}
                {modalObj.componentName && modalData}
            </div>
        </div>
    </Card>
}

const portalElement = document.getElementById('overlays');

const Modal = () => {
    return <>
        {ReactDOM.createPortal(<Backdrop><ModalOverlay /></Backdrop>, portalElement)}
    </>
}

export default Modal;
