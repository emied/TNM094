import { AvgDisplay } from './displays/avg-display.js';
import { LineChart } from './charts/line-chart.js';
import { RangeChart } from './charts/range-chart.js';
import { TableChart } from './charts/data-table-chart.js';

export class CompressorDashboard
{

	constructor(data, limits)
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
			//date.setHours(date.getHours(), Math.floor(date.getMinutes()/2.5)*2.5, 0, 0);
			return date;
		});

		var start = new Date(data.data[0].start_time);
		var end = new Date(data.data[data.data.length - 1].start_time);

		this.current_data = data.data[data.data.length - 1];

		this.createAttrMaps(limits);

		this.displays = [];
		this.attrs.forEach(attr => {
			this.displays.push(new AvgDisplay(this.cross_filter, '#avg-' + this.names.get(attr), attr, this.titles.get(attr), this.units.get(attr), this.modifiers.get(attr)));
		})

		this.compressor_text = "<h4 class='compressor-id'><br>Compressor: " + data.id + "</h4><br/><h4 class='compressor-location'>Location: " + data.location + "</h4>";
		$('#compressor-id').html(this.compressor_text + "<h4 class='compressor-time'>Last seen: " + data.data[data.data.length - 1].start_time + "</h4>" );

		this.range_chart_flow = new RangeChart(this.cross_filter, '#range-chart-flow', start, end, this.dimension,'flow');

		this.line_chart = new LineChart(this.cross_filter, '#line-chart-flow', 330, start, end, 'flow', this.range_chart_flow.chart, this.dimension, 1.0/60000.0);
		$('#click-flow').toggleClass('active');
		$('#line-chart-title').html('Flow (m<sup>3</sup>/s)');

		this.setClickListeners();
	}

	resize()
	{
		this.line_chart.resize();
		this.range_chart_flow.resize();
	}

	redraw(end)
	{
		this.line_chart.redraw(end);
		this.range_chart_flow.redraw(end);
		this.displays.forEach( display => display.redraw() );
	}

	addData(data)
	{
		if(data.length)
		{
			this.cross_filter.add(data);
			var end = new Date(data[data.length - 1].start_time);

			this.current_data = data[data.length - 1];

			$('#compressor-id').html(this.compressor_text + "<h4 class='compressor-time'>Last seen: " + data[data.length - 1].start_time + "</h4>" );

			this.redraw(end);
		}
	}

	createAttrMaps(lim)
	{
		this.attrs = ['flow', 'oil_temp', 'humidity', 'oil_pressure', 'ambient_temp', 'bearing_vibration'];
		var names = ['flow', 'oil-temp', 'humidity', 'oil-pressure', 'amb-temp', 'vibration'];
		var titles = ['Flow','Oil Temp','Humidity','Oil Pressure','Ambient Temp','Bearing Vibration'];
		var units = ['m<sup>3</sup>/s', '°C', '%', 'Bar', '°C', 'mm/s<sup>2</sup>'];
		var modifiers = [1.0/60000.0, 1, 1, 1, 1, 1];
		var limits = [undefined, undefined, undefined, [lim.pressure_warn, lim.pressure_break], undefined, [lim.vibration_warn, lim.vibration_break]];

		this.names = new Map();
		this.titles = new Map();
		this.units = new Map();
		this.modifiers = new Map();
		this.limits = new Map();

		this.attrs.forEach( (attr, i) => {
			this.names.set(attr, names[i]);
			this.titles.set(attr, titles[i]);
			this.units.set(attr, units[i]);
			this.modifiers.set(attr, modifiers[i]);
			this.limits.set(attr, limits[i]);
		})
	}

	setAttribute(attr)
	{
		this.line_chart.setAttribute(attr, this.modifiers.get(attr), this.limits.get(attr));
		d3.selectAll('.avg-box').classed('active', false);
		$('#click-' + this.names.get(attr)).toggleClass('active');
		$('#line-chart-title').html(this.titles.get(attr) + ' (' + this.units.get(attr) + ')');
	}

	setClickListeners()
	{
		this.attrs.forEach( attr => {
			$('#click-' + this.names.get(attr)).click({ attr: attr }, (event) => {
				this.setAttribute(event.data.attr);
			});
		});
	}
}
