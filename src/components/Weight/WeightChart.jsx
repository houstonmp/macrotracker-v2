import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import Card from '../UI/Card';
import { useState } from 'react';

import { useSelector } from "react-redux";

// blend two hex colors together by an amount
function blendColors(colorA, colorB, amount) {
    const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
    return '#' + r + g + b;
}

const WeightChart = (props) => {
    var style = getComputedStyle(document.body);
    const theme = useSelector(state => state.ui.theme.lightMode);

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
    let gammaCol2 = colorPrimaryBlue200;
    let gammaCol1 = colorPrimaryBlue400;
    let gammaCol = colorPrimaryBlue600;


    if (theme === 'dark') {
        alphaColDark = colorPrimaryBlue;
        gammaCol2 = colorPrimaryBlue400;
        gammaCol1 = colorPrimaryBlue200;
        gammaCol = colorPrimaryBlue;
    }

    const weightObj = useSelector(state => state.weight.weightObj);

    return <Card classes={props.classes}>
        <div>
            <Chart type='line' options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    x: {
                        grid: {
                            color: theme === 'light' ? alphaColLight : alphaColDark
                        }
                    },
                    y: {
                        grid: {
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
                            id: 1,
                            label: 'Weight',
                            data: weightObj.map((weight) => weight.lbs),
                            borderColor: gammaCol,
                        },
                        {
                            id: 2,
                            label: 'Goal Weight',
                            data: weightObj.map((weight) => 170),
                            borderColor: gammaCol1,
                        },
                        {
                            id: 3,
                            label: 'Goal Weight',
                            data: weightObj.map((weight) => 150),
                            borderColor: gammaCol2,
                        },
                    ]
                }} />
        </div>
    </Card>

}

export default WeightChart;