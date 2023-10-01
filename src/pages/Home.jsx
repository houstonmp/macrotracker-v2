import MacroList from "../components/Entry/MacroList";
import PageContent from "../components/PageContent"
import WeightEntry from "../components/Weight/WeightEntry";
import { useDispatch } from "react-redux";
import { uiActions } from "../components/store/ui-slice";
import FoodDiary from "../components/Entry/FoodDiary";
import WeightChart from "../components/Weight/WeightChart";
import classes from './Home.module.css';

const Home = (props) => {

  const dispatch = useDispatch();

  const showModalHandler = (e) => {
    dispatch(uiActions.showModal({
      title: 'Home',
      message: null,
      componentName: e.target.name,
      disableExit: false
    })
    )
  }


  return <PageContent title="Home">
    <FoodDiary></FoodDiary>
    <MacroList></MacroList>
    <WeightEntry
      onModal={showModalHandler} ></WeightEntry>
    <WeightChart classes={classes.chart} />
  </PageContent>
}

export default Home;