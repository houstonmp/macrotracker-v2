import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, Filler } from 'chart.js'
import Card from '../UI/Card';
import classes from "./WeightEntry.module.css"

import { useSelector } from "react-redux";
import { BMIBoundaries } from '../../assets/functions';

ChartJS.register(Filler);

const WeightChart = (props) => {
    var style = getComputedStyle(document.body);
    const theme = useSelector(state => state.ui.userPreferences.theme.lightMode);
    const user = useSelector(state => state.ui.userPreferences.user)

    let colorPrimaryBlue = '#E6F1F8';
    let colorPrimaryBlue100 = '#BFDCEE';
    let colorPrimaryBlue200 = '#8CC0E0';
    let colorPrimaryBlue300 = '#59A3D3';
    let colorPrimaryBlue400 = '#2687C5';
    let colorPrimaryBlue500 = '#0067A8';
    let colorPrimaryBlue600 = '#005083';
    let colorPrimaryBlue700 = '#00395E';
    let colorPrimaryBlue800 = '#002238';
    let colorPrimaryBlue900 = '#000B13';

    let alphaColLight = colorPrimaryBlue900;
    let alphaColDark = colorPrimaryBlue;
    // let gammaCol3 = colorPrimaryBlue;
    // let gammaCol2 = colorPrimaryBlue200;
    // let gammaCol1 = colorPrimaryBlue400;
    let gammaCol = colorPrimaryBlue600;


    if (theme === 'dark') {
        alphaColDark = colorPrimaryBlue;
        gammaCol = colorPrimaryBlue;
    }
    let gammaCol3 = colorPrimaryBlue600
    let gammaCol2 = colorPrimaryBlue400;
    let gammaCol1 = colorPrimaryBlue200;

    // }

    const weightObj = useSelector(state => state.weight.weightObj);

    return <Card classes={props.classes}>
        <Chart type='line' options={{

            maintainAspectRatio: true,

            color: alphaColDark,
            plugins: {
                tooltip: true,
                filler: {
                    backgroundColor: colorPrimaryBlue,
                },
                legend: {
                    display: false
                },
                responsive: true,
            },
            scales: {
                x: {
                    grid: {
                        color: theme === 'light' ? alphaColLight : alphaColDark
                    },
                    ticks: {
                        color: theme === 'light' ? alphaColLight : alphaColDark
                    }
                },
                y: {
                    grid: {
                        color: theme === 'light' ? alphaColLight : alphaColDark
                    },
                    ticks: {
                        color: theme === 'light' ? alphaColLight : alphaColDark
                    }
                }
            }
        }
        }
            data={{
                labels: weightObj.map((el) => el.date),
                datasets: [{
                    id: 1,
                    label: 'Weight',
                    data: weightObj.map((weight) => weight.lbs),
                    borderColor: gammaCol
                },

                {
                    id: 2,
                    label: 'BMI 18.5',
                    data: user.height && weightObj.map((weight) => BMIBoundaries(18.5, user.height.in)),
                    borderColor: gammaCol2,
                    backgroundColor: '#ff6384',
                    fill: true

                },
                {
                    id: 3,
                    label: 'BMI 25',
                    data: user.height && weightObj.map((weight) => BMIBoundaries(25, user.height.in)),
                    borderColor: gammaCol2,
                    backgroundColor: '#4bc0c0',
                    fill: true
                },
                {
                    id: 4,
                    label: 'BMI 30',
                    data: user.height && weightObj.map((weight) => BMIBoundaries(30, user.height.in)),
                    borderColor: gammaCol2,
                    fill: {
                        target: 'origin',
                        // above: '#ff6384',
                        below: '#ff9f40',
                    },
                    backgroundColor: '#ff9f40',
                },
                ]
            }} />
    </Card>

}

export default WeightChart;