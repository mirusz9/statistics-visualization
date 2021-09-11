const xAxisE = document.querySelector('#xAxis');
const yAxisE = document.querySelector('#yAxis');

let chart;

const convertToHours = (value) => {
	if (value instanceof Array) return value.map(convertToHours);
	const date = new Date(value - 2 * 60 * 60 * 1000);
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return { value: hours + minutes / 60 + seconds / 3600, label: date.toLocaleTimeString() };
};

const getDataPoints = (xName, yName, data) => {
	return data.reduce((trimmedData, currentDay) => {
		if (!(currentDay.hasOwnProperty(xName) && currentDay.hasOwnProperty(yName))) return trimmedData;
		let xValue = currentDay[xName];
		let yValue = currentDay[yName];
		if (
			!(
				(!(xValue instanceof Array) || (xValue instanceof Array && xValue.length > 0)) &&
				(!(yValue instanceof Array) || (yValue instanceof Array && yValue.length > 0))
			)
		)
			return trimmedData;

		if (/.+Time$/i.test(xName)) xValue = convertToHours(xValue);
		if (/.+Time$/i.test(yName)) yValue = convertToHours(yValue);

		let dataPoints = [];
		if (xValue instanceof Array) {
			xValue.forEach((_xValue) => {
				if (yValue instanceof Array) {
					yValue.forEach((_yValue) => {
						dataPoints.push({ x: _xValue, y: _yValue });
					});
				} else {
					dataPoints.push({ x: _xValue, y: yValue });
				}
			});
		} else {
			if (yValue instanceof Array) {
				yValue.forEach((_yValue) => {
					dataPoints.push({ x: xValue, y: _yValue });
				});
			} else {
				dataPoints.push({ x: xValue, y: yValue });
			}
		}

		dataPoints.forEach((dataPoint) => {
			const existingIndex = trimmedData.findIndex((dayObj) => {
				const dx = dataPoint.x instanceof Object ? dataPoint.x.value : dataPoint.x;
				const dy = dataPoint.y instanceof Object ? dataPoint.y.value : dataPoint.y;

				const ox = dayObj.x instanceof Object ? dayObj.x.value : dayObj.x;
				const oy = dayObj.y instanceof Object ? dayObj.y.value : dayObj.y;
				return ox == dx && oy == dy;
			});
			if (existingIndex !== -1) trimmedData[existingIndex].count++;
			else
				trimmedData.push({
					x: dataPoint.x,
					y: dataPoint.y,
					count: 1,
				});
		});

		return trimmedData;
	}, []);
};

const drawChart = (xName, yName, data) => {
	// console.log(xName, yName, data);
	const dataPoints = getDataPoints(xName, yName, data);
	const trace = {};

	const layout = { title: `${yName} vs. ${xName}` };
	chart = Plotly.newPlot('chart', [trace], layout);
};

const data = fetch('https://stats.mirusz9.com/getData', {
	method: 'PUT',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ token: '43ubtg4tyase' }),
})
	.then((res) => res.json())
	.then((data) => {
		console.log(data);
		xAxisE.addEventListener('change', (e) => {
			drawChart(e.target.value, yAxisE.value, data);
		});
		yAxisE.addEventListener('change', (e) => {
			drawChart(xAxisE.value, e.target.value, data);
		});
		drawChart(xAxisE.value, yAxisE.value, data);
	});
