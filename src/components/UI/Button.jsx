import styles from './Button.module.css';

const Button = (props) => {
    return <button name={props.name} type={props.type} className={styles.button} onClick={props.onClick}>{props.children}</button>
}

export default Button