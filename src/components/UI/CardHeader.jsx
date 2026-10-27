import classes from './CardHeader.module.css'

// The top of every card: icon badge, title, a short line of context, and an optional action
const CardHeader = ({ Icon, title, subtitle, children }) => {
    return <header className={classes.header}>
        {Icon && <span className={classes.badge}><Icon color="currentColor" /></span>}
        <span className={classes.titles}>
            <h3 className={classes.title}>{title}</h3>
            {subtitle && <span className={classes.subtitle}>{subtitle}</span>}
        </span>
        {children && <span className={classes.actions}>{children}</span>}
    </header>
}

export default CardHeader;
