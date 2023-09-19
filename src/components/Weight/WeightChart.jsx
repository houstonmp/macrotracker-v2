import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import Card from '../UI/Card';

import { useSelector } from "react-redux";

const WeightChart = (props) => {
    const weightObj = useSelector(state => state.weight.weightObj);
    console.log(weightObj);

    return <Card classes={props.classes}>
        <div>
            <Chart type='line' options={{
                responsive: true,
                maintainAspectRatio: true,
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
                            data: weightObj.map((weight) => 170)
                        },
                        {
                            id: 3,
                            label: 'Goal Weight',
                            data: weightObj.map((weight) => 150)
                        },
                    ]
                }} />
        </div>
    </Card>

}

export default WeightChart;