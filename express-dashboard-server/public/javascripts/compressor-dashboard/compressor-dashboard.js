import { AvgFlowDisplay } from './displays/avg-flow-display.js';
import { AvgVibrationDisplay } from './displays/avg-vibration-display.js';
import { AvgOilTempDisplay } from './displays/avg-oil-temp-display.js';
import { AvgAmbTempDisplay } from './displays/avg-amb-temp-display.js';

import { OilPressureChart } from './charts/oil-pressure-chart.js';

export class CompressorDashboard {
  constructor(data) {
    this.cross_filter = crossfilter(data);

    var start = new Date(data[0].start_time);
    var end = new Date(data[data.length - 1].start_time);

    this.avg_amb_temp_display = new AvgAmbTempDisplay(this.cross_filter, '#info-box-1');
    this.avg_flow_display = new AvgFlowDisplay(this.cross_filter, '#info-box-2');
    this.avg_vibration_display = new AvgVibrationDisplay(this.cross_filter, '#info-box-3');
    this.avg_oil_temp_display = new AvgOilTempDisplay(this.cross_filter, '#info-box-4');

    this.oil_pressure_chart = new OilPressureChart(this.cross_filter, '#line-chart-pressure', 330, start, end);

  }

  resize()
  {
    this.oil_pressure_chart.resize();
  }
}
