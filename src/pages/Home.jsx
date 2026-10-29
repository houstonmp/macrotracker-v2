import MacroList from "../components/Entry/MacroList";
import DayScore from "../components/Entry/DayScore";
import PageContent from "../components/PageContent"
import WeightEntry from "../components/Weight/WeightEntry";
import { useDispatch } from "react-redux";
import { uiActions } from "../components/store/ui-slice";
import FoodDiary from "../components/Entry/FoodDiary";
import WeightChart from "../components/Weight/WeightChart";
import WaterCard from "../components/Water/WaterCard";
import classes from './Home.module.css';

const Home = () => {  const dispatch = useDispatch();

  const showModalHandler = (e) => {
    dispatch(uiActions.showModal({
      title: 'Log weight',
      message: null,
      componentName: e.target.name,
      disableExit: false
    })
    )
  }


  return <PageContent title="Home">
    <FoodDiary showLogLink />
    <MacroList></MacroList>
    <DayScore />
    <WaterCard />
    <WeightEntry
      onModal={showModalHandler} ></WeightEntry>
    <WeightChart classes={classes.chart} />
  </PageContent>
}

export default Home;