import PageContent from "../components/PageContent"
import Card from '../components/UI/Card'
import classes from './Insights.module.css'

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from "../components/store/ui-slice";
import { selectDailyTargets, selectLatestWeight } from "../components/store/selectors";
import CardHeader from "../components/UI/CardHeader";
import StatTile, { StatGrid } from "../components/UI/StatTile";
import { FlagIcon } from "../assets/StatIcons";
import { formatDay } from "../assets/functions";

import WeightEntry from "../components/Weight/WeightEntry";
import WeightChart from "../components/Weight/WeightChart";
import WeightScore from "../components/Weight/WeightScore";
import ReportCard from "../components/Insights/ReportCard";

// Hints say where each number comes from
const TARGETS = [
    { stat: 'BMR', hint: 'Burned at rest', value: targets => targets.BMR },
    { stat: 'TDEE', hint: 'Burned with activity', value: targets => targets.TDEEValue },
    { stat: 'calories', label: 'Goal calories', hint: 'TDEE minus your goal', value: targets => targets.dailyMacros.goalCalories },
    { stat: 'protein', hint: '40% of calories', value: targets => targets.dailyMacros.goalProtein },
    { stat: 'carbs', hint: '40% of calories', value: targets => targets.dailyMacros.goalCarbs },
    { stat: 'fat', hint: '20% of calories', value: targets => targets.dailyMacros.goalFat },
];

const Insights = () => {
    const dispatch = useDispatch();
    const targets = useSelector(selectDailyTargets);
    const latestWeight = useSelector(selectLatestWeight);
    // The report card and weight score follow whichever week, month or year the chart is showing
    const [rangeId, setRangeId] = useState('month');
    const [offset, setOffset] = useState(0);

    const showModalHandler = (e) => {
        dispatch(uiActions.showModal({
            title: 'Log weight',
            message: null,
            componentName: e.target.name,
            disableExit: false
        })
        )
    }

    return <PageContent title="Insights">
        <WeightEntry onModal={showModalHandler} />
        <WeightChart rangeId={rangeId} onRangeChange={setRangeId} offset={offset} onOffsetChange={setOffset} />
        <ReportCard rangeId={rangeId} offset={offset} classes={classes.report} />
        <WeightScore rangeId={rangeId} offset={offset} />
        <Card classes={classes.targets}>
            <CardHeader Icon={FlagIcon} title="Daily targets" subtitle={latestWeight
                ? `From your ${latestWeight.lbs} lbs weigh-in on ${formatDay(latestWeight.date)}`
                : 'Add a weigh-in to see your daily targets'} />
            {targets && <StatGrid columns={3}>
                {TARGETS.map(({ stat, label, hint, value }) =>
                    <StatTile key={stat} stat={stat} label={label} value={value(targets)} hint={hint} />)}
            </StatGrid>}
        </Card>
    </PageContent>
}

export default Insights;
