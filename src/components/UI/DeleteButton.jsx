import classes from './DeleteButton.module.css';

const DeleteButton = (props) => {
    return <button type="button" className={classes.delete} onClick={props.onClick} aria-label={props.label} title={props.label}>✕</button>
}

export default DeleteButton;
