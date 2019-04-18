import { AvgFlowDisplay } from './displays/avg-flow-display.js';
import { AvgVibrationDisplay } from './displays/avg-vibration-display.js';
import { AvgOilTempDisplay } from './displays/avg-oil-temp-display.js';
import { AvgAmbTempDisplay } from './displays/avg-amb-temp-display.js';
import { MinuteLineChart } from './charts/minute-line-chart.js';
import { RangeChart } from './charts/range-chart.js';
import { CompressorIdDisplay } from './displays/compressor-id-display.js';


export class CompressorIdDashboard{
    constructor(data) {
      this.cross_filter = crossfilter(data);
      this.dimension = this.cross_filter.dimension(function(d) {
        var minute = new Date(d.start_time);
        minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
        return minute;
      });

      this.avg_amb_temp_display = new AvgAmbTempDisplay(this.cross_filter, '#info-box-1');
      this.avg_flow_display = new AvgFlowDisplay(this.cross_filter, '#info-box-2');
      this.avg_vibration_display = new AvgVibrationDisplay(this.cross_filter, '#info-box-3');
      this.avg_oil_temp_display = new AvgOilTempDisplay(this.cross_filter, '#info-box-4');
      this.compressor_id_display = new CompressorIdDisplay(this.cross_filter, '#compressor-id', '325', 'Norrköping')
  }

}
