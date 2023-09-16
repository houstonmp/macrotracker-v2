import classes from "./Table.module.css";

const Table = (props) => {
    return <table className={`${classes.table} ${props.tableClasses}`}>
        <thead className={classes.thead}>
            {props.header}
        </thead>
        <tbody className={classes.tbody}>
            {props.children}
        </tbody>
    </table>
}

export default Table;