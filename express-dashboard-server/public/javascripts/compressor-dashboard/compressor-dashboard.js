import { AvgFlowDisplay } from './displays/avg-flow-display.js';
import { AvgVibrationDisplay } from './displays/avg-vibration-display.js';
import { AvgOilTempDisplay } from './displays/avg-oil-temp-display.js';
import { AvgAmbTempDisplay } from './displays/avg-amb-temp-display.js';
import { MinuteLineChart } from './charts/minute-line-chart.js';
import { RangeChart } from './charts/range-chart.js';

export class CompressorDashboard {
  constructor(data) {

    dc.config.defaultColors([
			"#3182bd","#6baed6","#9ecae1","#c6dbef","#e6550d",
			"#fd8d3c","#fdae6b","#fdd0a2","#31a354","#74c476",
			"#a1d99b","#c7e9c0","#756bb1","#9e9ac8","#bcbddc",
			"#dadaeb","#636363","#969696","#bdbdbd","#d9d9d9"
		]);

    this.cross_filter = crossfilter(data);
    this.dimension = this.cross_filter.dimension(function(d) {
      var minute = new Date(d.start_time);
      minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
      return minute;
    });

    var start = new Date(data[0].start_time);
    var end = new Date(data[data.length - 1].start_time);

    this.avg_amb_temp_display = new AvgAmbTempDisplay(this.cross_filter, '#info-box-1', 'info-box-text', 'Average ');
    this.avg_flow_display = new AvgFlowDisplay(this.cross_filter, '#info-box-2', 'info-box-text', 'Average ');
    this.avg_vibration_display = new AvgVibrationDisplay(this.cross_filter, '#info-box-3', 'info-box-text', 'Average ');
    this.avg_oil_temp_display = new AvgOilTempDisplay(this.cross_filter, '#info-box-4', 'info-box-text', 'Average ');

    this.range_chart_flow = new RangeChart(this.cross_filter, '#range-chart-flow', start, end, this.dimension,'flow');
    this.range_chart_oil_temp = new RangeChart(this.cross_filter, '#range-chart-oil-temp', start, end, this.dimension, 'oil_temp');
    this.range_chart_oil_pressure = new RangeChart(this.cross_filter, '#range-chart-oil-pressure', start, end, this.dimension, 'oil_pressure');
    this.range_chart_bearing_vibration = new RangeChart(this.cross_filter, '#range-chart-bearing-vibration', start, end, this.dimension, 'bearing_vibration');
    this.range_chart_humidty = new RangeChart(this.cross_filter, '#range-chart-humidity', start, end, this.dimension, 'humidity');
    this.range_chart_ambient_temp = new RangeChart(this.cross_filter, '#range-chart-ambient-temp', start, end, this.dimension, 'ambient_temp');


    this.flow_chart = new MinuteLineChart(this.cross_filter, '#line-chart-flow', 330, start, end, 'Flow (enhet)', 'flow', this.range_chart_flow.chart, this.dimension);
    this.oil_temp_chart = new MinuteLineChart(this.cross_filter, '#line-chart-temp', 330, start, end, 'Oil Temp (°C)', 'oil_temp', this.range_chart_oil_temp.chart, this.dimension);
    this.oil_pressure_chart = new MinuteLineChart(this.cross_filter, '#line-chart-pressure', 330, start, end, 'Oil Pressure (Bar)', 'oil_pressure', this.range_chart_oil_pressure.chart, this.dimension);
    this.bearing_vibration_chart = new MinuteLineChart(this.cross_filter, '#line-chart-bearing-vibration', 330, start, end, 'Bearing Vibration ()', 'bearing_vibration', this.range_chart_bearing_vibration.chart, this.dimension);
    this.humidity_chart = new MinuteLineChart(this.cross_filter, '#line-chart-humidity', 330, start, end, 'humidity ()', 'humidity', this.range_chart_humidty.chart, this.dimension);
    this.ambient_temp_chart = new MinuteLineChart(this.cross_filter, '#line-chart-ambient-temp', 330, start, end, 'Ambient Temp ()', 'ambient_temp', this.range_chart_ambient_temp.chart, this.dimension);

  }

  resize()
  {
    this.oil_temp_chart.resize();
    this.flow_chart.resize();
    this.range_chart_flow.resize();
    this.range_chart_oil_temp.resize();

  }
}
