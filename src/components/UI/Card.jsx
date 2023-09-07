import styles from './Card.module.css'

const Card = (props) => {
    return <div className={`${styles.card} ${props.classes ? props.classes : ''}`}>
        {props.children}
    </div>
}

export default Card;