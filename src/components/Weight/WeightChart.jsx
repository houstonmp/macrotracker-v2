import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { Filler } from 'chart.js'
import Card from '../UI/Card';
import classes from "./WeightEntry.module.css"

import { useSelector } from "react-redux";
import { BMIBoundaries } from '../../assets/functions';

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
    let gammaCol3 = colorPrimaryBlue;
    let gammaCol2 = colorPrimaryBlue200;
    let gammaCol1 = colorPrimaryBlue400;
    let gammaCol = colorPrimaryBlue600;


    if (theme === 'dark') {
        alphaColDark = colorPrimaryBlue;
        gammaCol3 = colorPrimaryBlue600
        gammaCol2 = colorPrimaryBlue400;
        gammaCol1 = colorPrimaryBlue200;
        gammaCol = colorPrimaryBlue;
    }

    console.log(user)

    const weightObj = useSelector(state => state.weight.weightObj);
    // ChartJS.register(Filler)

    return <Card classes={props.classes}>
        <div className={classes.backgroundColor}>
            <Chart type='line' options={{
                responsive: true,
                maintainAspectRatio: true,
                color: alphaColDark,
                plugins: {
                    tooltip: true,
                    filler: {
                        backgroundColor: colorPrimaryBlue,
                    }
                    // customCanvasBackgroundColor: {
                    //     color: colorPrimaryBlue800,
                    //     fill: true
                    // }
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
                    datasets: [

                        {
                            id: 2,
                            label: 'BMI 18.5',
                            data: user.height && weightObj.map((weight) => BMIBoundaries(18.5, user.height.in)),
                            borderColor: gammaCol1,

                        },
                        {
                            id: 3,
                            label: 'BMI 25',
                            data: user.height && weightObj.map((weight) => BMIBoundaries(25, user.height.in)),
                            borderColor: gammaCol2,
                        },
                        {
                            id: 4,
                            label: 'BMI 30',
                            data: user.height && weightObj.map((weight) => BMIBoundaries(30, user.height.in)),
                            borderColor: gammaCol3,
                        }, {
                            id: 1,
                            label: 'Weight',
                            data: weightObj.map((weight) => weight.lbs),
                            borderColor: gammaCol
                        },
                    ]
                }} />
        </div>
    </Card>

}

export default WeightChart;