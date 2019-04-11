import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../avg-reduce.js';

export class AvgVibrationDisplay {

	constructor(cross_filter, container_id) {
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

    this.group = cross_filter.groupAll().reduce(reduceAddAvg("bearing_vibration"), reduceRemoveAvg("bearing_vibration"), reduceInitAvg);

    this.display
      .formatNumber(d3.format(".2f"))
      .valueAccessor( d => { return d.count ? (d.sum / ((d.count))) : 0 })
      .html({some: "<h4 class='info-box-text'><br>Average Bearing Vibration</h4><h5 class='info-box-text'>%number mm/s<sup>2</sup></h5>"})
      .group(this.group);

		this.display.render();
	}
}