import classes from "./Table.module.css";
import { forwardRef } from 'react'

const Table = forwardRef((props, ref) => {
    const setStyle = () => {
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
            td:nth-child(6n),
            td:nth-child(7n),
            td:nth-child(8n),
            td:nth-child(9n),
            td:nth-child(10n),
            td:nth-child(11n),
            td:nth-child(12n) {
                border-left: 1px solid black;
            }
            td:nth-child(12n) {
                border-right: 1px solid black;
            }
            tr:nth-child(2n-1) td{
                background-color: lightgray !important;
            }
            input[type="checkbox"] {
                accent-color: black; !important;
            }
        }`;
    };

    return <table ref={ref} className={`${classes.table} ${props.tableClasses}`}>
        <style>{setStyle()}</style>
        <thead className={classes.thead}>
            {props.header}
        </thead>
        <tbody className={classes.tbody}>
            {props.children}
        </tbody>
    </table>
})

export default Table;