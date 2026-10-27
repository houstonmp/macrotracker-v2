import Table from "../../UI/Table"
import DeleteButton from "../../UI/DeleteButton";
import classes from './EntryCard.module.css'
import { ingredientNames } from "../../../assets/food";

const IngredientData = (props) => {
    return <Table tableClasses={classes['ingredient-table']} header={
        <tr>
            <th>Food Name</th>
            <th>Ingredients</th>
            <th></th>
        </tr>
    }>
        {props.tableData.map((item) => {
            return (<tr key={item.id} onClick={() => props.onLog(item)}>
                <td title={item.name}>{item.name.substr(0, 10)}</td>
                <td>
                    <ul>
                        {ingredientNames(props.list, item).map((name, index) => <li key={`ing-${index}`}>{`${name.split(',')[0]},`}</li>)}
                    </ul>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                    <DeleteButton label={`Delete ${item.name}`} onClick={() => props.onDelete(item)} />
                </td>
            </tr>)
        })
        }
    </Table>
}

export default IngredientData;
