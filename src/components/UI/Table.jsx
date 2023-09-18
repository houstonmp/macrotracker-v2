import classes from "./Table.module.css";
import { forwardRef } from 'react'

const Table = forwardRef((props, ref) => {
    const getPageMargins = () => {
        return `
        @media print {
            @page {
                // size: landscape;
                margin: 15.05mm !important;
                padding: 0 !important;
            }
            // html, body {
            //     width:  200mm !important;
            //     height: 100vh !important;
            // }
        }`;
    };

    return <table ref={ref} className={`${classes.table} ${props.tableClasses}`}>
        <style>{getPageMargins()}</style>
        <thead className={classes.thead}>
            {props.header}
        </thead>
        <tbody className={classes.tbody}>
            {props.children}
        </tbody>
    </table>
})

export default Table;