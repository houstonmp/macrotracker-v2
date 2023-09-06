import styles from './Modal.module.css';
import ReactDOM, { createPortal } from 'react-dom';
import Card from './Card';

const Backdrop = props => {
    return <div onClick={props.onClose} className={styles.backdrop}>

           </div>
}

const ModalOverlay = props => {
    return  <div className={styles.modal}>
                <div className={styles.content}>
                    {props.children}
                </div>
            </div>
}

const portalElement = document.getElementById('overlays');

const Modal = (props) => {
    return <>
        {ReactDOM.createPortal(<Backdrop onClose={props.onClose} />, portalElement)}
        {ReactDOM.createPortal(<ModalOverlay>{props.children}</ModalOverlay>, portalElement)}
    </>
}

export default Modal;