import Table from "../../UI/Table"
import classes from './EntryCard.module.css'

const MacroData = (props) => {
    return <Table tableClasses={classes['recipe-table']} header={
        <tr>
            <th>Food Name</th>
            <th>Total Calories</th>
            <th>Protein (g)</th>
            <th>Carbs (g)</th>
            <th>Fat (g)</th>
        </tr>
    }>
        {props.tableData.map((item, index) => {
            return (<tr key={`${item.name}-${index}`} id={index} onClick={props.onClickHandler}>
                <td key={`name-${item.name}`}>
                    {item.name.substr(0, 10)}
                </td>
                <td key={`cal-${item.name}`}>
                    {item.calories}
                </td>
                <td key={`protein-${item.name}`}>
                    {item.tProtein}
                </td>
                <td key={`carbs-${item.name}`}>
                    {item.tCarbs}
                </td>
                <td key={`fat-${item.name}`}>
                    {item.tFat}
                </td>
            </tr>)
        })
        }
    </Table>
}

export default MacroData;