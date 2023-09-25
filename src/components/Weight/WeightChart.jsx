import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import Card from '../UI/Card';
import { useState } from 'react';

import { useSelector } from "react-redux";

const WeightChart = (props) => {
    var style = getComputedStyle(document.body);
    var primCol = style.getPropertyValue('--color-gamma-400');

    const theme = useSelector(state => state.ui.theme.lightMode);
    const weightObj = useSelector(state => state.weight.weightObj);
    console.log(weightObj);


    return <Card classes={props.classes}>
        <div>
            <Chart type='line' options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            color: theme === 'light' ? 'black' : 'white'
                        }
                    },
                    y: {
                        grid: {
                            color: theme === 'light' ? 'black' : 'white'
                        }
                    }
                }
            }
            }
                data={{
                    labels: weightObj.map((el) => el.date),
                    datasets: [
                        {
                            id: 1,
                            label: 'Weight',
                            data: weightObj.map((weight) => weight.lbs)
                        },
                        {
                            id: 2,
                            label: 'Goal Weight',
                            data: weightObj.map((weight) => 170),
                            borderColor: 'orange',
                        },
                        {
                            id: 3,
                            label: 'Goal Weight',
                            data: weightObj.map((weight) => 150),
                            borderColor: 'green',
                        },
                    ]
                }} />
        </div>
    </Card>

}

export default WeightChart;