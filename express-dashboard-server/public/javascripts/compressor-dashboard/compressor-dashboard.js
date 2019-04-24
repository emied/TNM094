import { AvgDisplay } from './displays/avg-display.js';
import { LineChart } from './charts/line-chart.js';
import { RangeChart } from './charts/range-chart.js';

export class CompressorDashboard
{

	constructor(data) 
	{
		dc.config.defaultColors([
			"#3182bd","#6baed6","#9ecae1","#c6dbef","#e6550d",
			"#fd8d3c","#fdae6b","#fdd0a2","#31a354","#74c476",
			"#a1d99b","#c7e9c0","#756bb1","#9e9ac8","#bcbddc",
			"#dadaeb","#636363","#969696","#bdbdbd","#d9d9d9"
		]);

		this.cross_filter = crossfilter(data.data);
		this.dimension = this.cross_filter.dimension(function(d) {
			var date = new Date(d.start_time);
			date.setHours(date.getHours(), 0, 0, 0);
			return date;
		});

		var start = new Date(data.data[0].start_time);
		var end = new Date(data.data[data.data.length - 1].start_time);

		this.avg_amb_temp_display = new AvgDisplay(this.cross_filter, '#avg-amb-temp', 'ambient_temp', 'Ambient Temperature', '°C');
		this.avg_flow_display = new AvgDisplay(this.cross_filter, '#avg-flow', 'flow', 'Flow', 'm<sup>3</sup>/s', 1.0/60000.0);
		this.avg_vibration_display = new AvgDisplay(this.cross_filter, '#avg-vibration', 'bearing_vibration', 'Bearing Vibration', 'mm/s<sup>2</sup>');
		this.avg_oil_temp_display = new AvgDisplay(this.cross_filter, '#avg-oil-temp', 'oil_temp', 'Oil Temperature', '°C');
		this.avg_humidity_display = new AvgDisplay(this.cross_filter, '#avg-humidity', 'humidity', 'Humidity', '%');
		this.avg_oil_pressure_display = new AvgDisplay(this.cross_filter, '#avg-oil-pressure', 'oil_pressure', 'Oil Pressure', 'bar');

		// Using crossfiltered DC.js display for this doesn't make sense
		// threw in 'last seen' to give some indication of real-time, change
		this.compressor_text = "<h4 class='compressor-id'><br>Compressor: " + data.id + "</h4><br/><h4 class='compressor-location'>Location: " + data.location + "</h4>";
		$('#compressor-id').html(this.compressor_text + "<h4 class='compressor-time'>Last seen: " + data.data[data.data.length - 1].start_time + "</h4>" );

		this.range_chart_flow = new RangeChart(this.cross_filter, '#range-chart-flow', start, end, this.dimension,'flow');
		this.range_chart_oil_temp = new RangeChart(this.cross_filter, '#range-chart-oil-temp', start, end, this.dimension, 'oil_temp');
		this.range_chart_oil_pressure = new RangeChart(this.cross_filter, '#range-chart-oil-pressure', start, end, this.dimension, 'oil_pressure');
		this.range_chart_bearing_vibration = new RangeChart(this.cross_filter, '#range-chart-bearing-vibration', start, end, this.dimension, 'bearing_vibration');
		this.range_chart_humidty = new RangeChart(this.cross_filter, '#range-chart-humidity', start, end, this.dimension, 'humidity');
		this.range_chart_ambient_temp = new RangeChart(this.cross_filter, '#range-chart-ambient-temp', start, end, this.dimension, 'ambient_temp');

		this.flow_chart = new LineChart(this.cross_filter, '#line-chart-flow', 330, start, end, 'Flow (enhet)', 'flow', this.range_chart_flow.chart, this.dimension, 1.0/60000.0);
		//this.oil_temp_chart = new LineChart(this.cross_filter, '#line-chart-temp', 330, start, end, 'Oil Temp (°C)', 'oil_temp', this.range_chart_oil_temp.chart, this.dimension);
		//this.oil_pressure_chart = new LineChart(this.cross_filter, '#line-chart-pressure', 330, start, end, 'Oil Pressure (Bar)', 'oil_pressure', this.range_chart_oil_pressure.chart, this.dimension);
		//this.bearing_vibration_chart = new LineChart(this.cross_filter, '#line-chart-bearing-vibration', 330, start, end, 'Bearing Vibration ()', 'bearing_vibration', this.range_chart_bearing_vibration.chart, this.dimension);
		//this.humidity_chart = new LineChart(this.cross_filter, '#line-chart-humidity', 330, start, end, 'humidity ()', 'humidity', this.range_chart_humidty.chart, this.dimension);
		//this.ambient_temp_chart = new LineChart(this.cross_filter, '#line-chart-ambient-temp', 330, start, end, 'Ambient Temp ()', 'ambient_temp', this.range_chart_ambient_temp.chart, this.dimension);
	}

	resize()
	{
		//this.oil_temp_chart.resize();
		this.flow_chart.resize();
		this.range_chart_flow.resize();
		//this.range_chart_oil_temp.resize();
	}

	redraw(end)
	{
		this.flow_chart.redraw(end);
		this.range_chart_flow.redraw(end);
	}

	addData(data)
	{
		if(data.length)
		{
			this.cross_filter.add(data);
			var end = new Date(data[data.length - 1].start_time);

			$('#compressor-id').html(this.compressor_text + "<h4 class='compressor-time'>Last seen: " + data[data.length - 1].start_time + "</h4>" );

			this.redraw(end);
		}
	}
}
