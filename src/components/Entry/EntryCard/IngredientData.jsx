import Table from "../../UI/Table"
import classes from './EntryCard.module.css'

const IngredientData = (props) => {
    return <Table tableClasses={classes['ingredient-table']} header={
        <tr>
            <th>Food Name</th>
            <th>Ingredients</th>
        </tr>
    }>
        {props.tableData.length >= 0 && props.tableData.map((item, index) => {
            return (<tr key={`${item.name}-${index}`} id={index} onClick={props.onClickHandler}>
                <td key={`name-${item.name}`}>
                    {item.name.substr(0, 10)}
                </td>
                <td key={`ingredients-${item.name}`}>
                    <ul>
                        {item.ingredients.map((el, index) => {
                            return <li key={`ing-${el}${index}`}>{`${el},`}</li>
                        })}
                    </ul>
                </td>
            </tr>)
        })
        }
    </Table>
}

export default IngredientData;