import Table from "../../UI/Table"
import DeleteButton from "../../UI/DeleteButton";
import classes from './EntryCard.module.css'
import { listEntryMacros } from "../../../assets/food";

const MacroData = (props) => {
    return <Table tableClasses={classes['recipe-table']} header={
        <tr>
            <th>Food Name</th>
            <th>Calories</th>
            <th>Protein (g)</th>
            <th>Carbs (g)</th>
            <th>Fat (g)</th>
            <th></th>
        </tr>
    }>
        {props.tableData.map((item) => {
            const macros = listEntryMacros(props.list, item);
            return (<tr key={item.id} onClick={() => props.onLog(item)}>
                <td title={item.name}>{item.name.substr(0, 10)}</td>
                <td>{Math.round(macros.calories)}</td>
                <td>{macros.protein}</td>
                <td>{macros.carbs}</td>
                <td>{macros.fat}</td>
                <td onClick={(e) => e.stopPropagation()}>
                    <DeleteButton label={`Delete ${item.name}`} onClick={() => props.onDelete(item)} />
                </td>
            </tr>)
        })
        }
    </Table>
}

export default MacroData;
