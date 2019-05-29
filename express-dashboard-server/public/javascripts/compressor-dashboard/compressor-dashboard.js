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

		var start = new Date(data.data[0].start_time);
		var end = new Date(data.data[data.data.length - 1].start_time);

		this.cross_filter = crossfilter(data.data);
		this.dimension = this.cross_filter.dimension(function(d) {
			var date = new Date(d.start_time);
			if(data.data.length <= 500)
			{
				return date;
			}
			var step = ((end-start)/500); 
			return new Date(start.valueOf() + Math.round((date-start)/step)*step);
		});

		this.current_data = data.data[data.data.length - 1];

		this.createAttrMaps(limits);

		this.displays = [];
		this.attrs.forEach(attr => {
			this.displays.push(new AvgDisplay(this.cross_filter, '#avg-' + this.names.get(attr), attr, this.titles.get(attr), this.units.get(attr), this.modifiers.get(attr)));
		})

		this.status_text = ['Working', 'Warning', 'Broken'];
		this.compressor_text = "<h4 class='compressor-id'><br>Compressor: " + data.id + "</h4>";
		this.compressor_text += "<br/><h4 class='compressor-location'>Location: " + data.location + "</h4>";

		$('#compressor-id').html(
			this.compressor_text +
			"<h4 class='compressor-time'>Last seen: " + this.current_data.start_time + "</h4>" +
			"<h4 class='compressor-time'>Status: " + this.status_text[data.status] + "</h4>"
		);

		this.range_chart_flow = new RangeChart(this.cross_filter, '#range-chart-flow', start, end, this.dimension,'flow');

		this.line_chart = new LineChart(this.cross_filter, '#line-chart-flow', 330, start, end, data.attr, this.range_chart_flow.chart, this.dimension, this.modifiers.get(data.attr), this.limits.get(data.attr));
		$('#click-' + this.names.get(data.attr)).toggleClass('active');
		$('#line-chart-title').html(this.titles.get(data.attr) + ' (' + this.units.get(data.attr) + ')');

		this.setClickListeners();

		if(data.status != 0)
		{
			this.mode = 'realtime';
			this.redraw();
		}
	}

	resize()
	{
		this.line_chart.resize();
		this.range_chart_flow.resize();
	}

	redraw()
	{
		this.line_chart.redraw(new Date(this.current_data.start_time));
		this.range_chart_flow.redraw(new Date(this.current_data.start_time));
		if(this.mode == 'realtime')
		{
			$('#displays-title').html('Real-Time Values:');
			this.displays.forEach( display => display.redraw(+this.current_data[display.attr]) );
		}
		else
		{
			$('#displays-title').html('Averages:');
			this.displays.forEach( display => display.redraw() );
		}
	}

	addData(data)
	{
		if(data.data.length)
		{
			this.cross_filter.add(data.data);

			this.current_data = data.data[data.data.length - 1];

			$('#compressor-id').html(
				this.compressor_text +
				"<h4 class='compressor-time'>Last seen: " + this.current_data.start_time + "</h4>" +
				"<h4 class='compressor-time'>Status: " + this.status_text[data.status] + "</h4>"
			);

			this.redraw();
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

		$('#switch-compressor-mode').click( event => {
			this.mode = this.mode == 'normal' ? 'realtime' : 'normal';
			this.redraw(new Date(this.current_data.start_time));
		})
	}
}
