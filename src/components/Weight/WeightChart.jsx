import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, Filler } from 'chart.js'
import Card from '../UI/Card';
import classes from './WeightChart.module.css';

import { useSelector } from "react-redux";
import { BMIBoundaries } from '../../assets/functions';

ChartJS.register(Filler);

// The healthy BMI range is the target. Either side is tinted softly rather than in
// warning colours: a faint red below, then blue (BMI 25-30) and purple (30+) above.
const HEALTHY_LINE = 'rgba(76, 175, 120, 0.6)';
const HEALTHY_FILL = 'rgba(76, 175, 120, 0.15)';
const BELOW_FILL = 'rgba(220, 90, 90, 0.1)';
const ABOVE_FILL = 'rgba(70, 130, 200, 0.1)';
const WELL_ABOVE_FILL = 'rgba(140, 100, 200, 0.1)';

const WeightChart = (props) => {
    const theme = useSelector(state => state.ui.userPreferences.theme.lightMode);
    const user = useSelector(state => state.ui.userPreferences.user)
    const weightObj = useSelector(state => state.weight.weightObj);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#E6F1F8' : '#000B13';
    const gridColor = isDark ? 'rgba(230, 241, 248, 0.1)' : 'rgba(0, 11, 19, 0.08)';
    const referenceLine = isDark ? 'rgba(230, 241, 248, 0.3)' : 'rgba(0, 11, 19, 0.25)';
    const weightLine = isDark ? '#E6F1F8' : '#005083';

    const heightIn = user.height && user.height.in;
    const boundary = (bmi) => heightIn && weightObj.map(() => BMIBoundaries(bmi, heightIn));

    const referenceDataset = { pointRadius: 0, pointHitRadius: 0, borderWidth: 1 };

    // The box sets the height; a fixed aspect ratio made the chart unreadably short on phones
    return <Card classes={`${classes.chart} ${props.classes || ''}`}>
        <div className={classes.chartBox}>
            <Chart type='line' options={{
                maintainAspectRatio: false,
                responsive: true,
                color: textColor,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        filter: (item) => !item.dataset.hideFromTooltip
                    },
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    }
                }
            }}
                data={{
                    labels: weightObj.map((el) => el.date),
                    datasets: [
                        {
                            label: 'Weight (lbs)',
                            data: weightObj.map((weight) => weight.lbs),
                            borderColor: weightLine,
                            backgroundColor: weightLine,
                            borderWidth: 2,
                        },
                        {
                            ...referenceDataset,
                            label: 'Healthy range from (BMI 18.5)',
                            data: boundary(18.5),
                            borderColor: HEALTHY_LINE,
                            backgroundColor: BELOW_FILL,
                            fill: 'start',
                        },
                        {
                            ...referenceDataset,
                            label: 'Healthy range to (BMI 24.9)',
                            data: boundary(25),
                            borderColor: HEALTHY_LINE,
                            backgroundColor: HEALTHY_FILL,
                            // Fill down to the BMI 18.5 line, shading only the healthy range
                            fill: '-1',
                        },
                        {
                            ...referenceDataset,
                            label: 'BMI 30',
                            data: boundary(30),
                            borderColor: referenceLine,
                            borderDash: [4, 4],
                            backgroundColor: ABOVE_FILL,
                            // Fill down to the BMI 25 line
                            fill: '-1',
                        },
                        {
                            // A line can only fill one area, so an invisible copy of the
                            // BMI 30 line tints everything above it
                            ...referenceDataset,
                            label: 'Above BMI 30',
                            data: boundary(30),
                            borderWidth: 0,
                            backgroundColor: WELL_ABOVE_FILL,
                            fill: 'end',
                            hideFromTooltip: true,
                        },
                    ]
                }} />
        </div>
    </Card>

}

export default WeightChart;
