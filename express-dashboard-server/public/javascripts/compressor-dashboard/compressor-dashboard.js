import { AvgFlowDisplay } from './displays/avg-flow-display.js';
import { AvgVibrationDisplay } from './displays/avg-vibration-display.js';
import { AvgOilTempDisplay } from './displays/avg-oil-temp-display.js';
import { AvgAmbTempDisplay } from './displays/avg-amb-temp-display.js';
import { MinuteLineChart } from './charts/minute-line-chart.js';
import { RangeChart } from './charts/range-chart.js';

export class CompressorDashboard {
  constructor(data) {
    this.cross_filter = crossfilter(data);

    this.dimension = this.cross_filter.dimension(function(d) {
      var minute = new Date(d.start_time);
      minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
      return minute;
    });

    var start = new Date(data[0].start_time);
    var end = new Date(data[data.length - 1].start_time);

    this.avg_amb_temp_display = new AvgAmbTempDisplay(this.cross_filter, '#info-box-1');
    this.avg_flow_display = new AvgFlowDisplay(this.cross_filter, '#info-box-2');
    this.avg_vibration_display = new AvgVibrationDisplay(this.cross_filter, '#info-box-3');
    this.avg_oil_temp_display = new AvgOilTempDisplay(this.cross_filter, '#info-box-4');

    this.range_chart = new RangeChart(this.cross_filter, '#range-chart', start, end, this.dimension)

    this.oil_pressure_chart = new MinuteLineChart(this.cross_filter, '#line-chart-pressure', 330, start, end, 'Oil Temp (°C)', 'oil_temp', [40, 51], this.range_chart.chart, this.dimension);

  }

  resize()
  {
    this.oil_pressure_chart.resize();
    this.range_chart.resize();
  }
}
