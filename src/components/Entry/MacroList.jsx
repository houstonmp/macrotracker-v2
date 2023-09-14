import classes from "./MacroList.module.css"

import Card from "../UI/Card"

const MacroList = (props) => {
    return <Card>
        <div className={classes.macros}>
            <div><h1>{props.macroList.calories}</h1><span>kCal</span></div>
            <div><h1>{props.macroList.tProtein}/20 </h1><span>(g) Protein</span></div>
            <div><h1>{props.macroList.tCarbs}/150 </h1><span>(g) Carbs</span></div>
            <div><h1>{props.macroList.tFat}/20</h1><span>(g) Fat</span></div>
        </div>
    </Card>
}

export default MacroList;