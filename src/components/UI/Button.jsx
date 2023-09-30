import styles from './Button.module.css';

const Button = (props) => {
    return <button name={props.name} type={props.type} className={`${styles.button} ${props.classes}`} onClick={props.onClick} disabled={props.disable}>{props.children} </button>
}

export default Button