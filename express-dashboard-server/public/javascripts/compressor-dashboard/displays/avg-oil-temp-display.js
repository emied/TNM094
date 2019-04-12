import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class AvgOilTempDisplay {

	constructor(cross_filter, container_id) {
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

    this.group = cross_filter.groupAll().reduce(reduceAddAvg("oil_temp"), reduceRemoveAvg("oil_temp"), reduceInitAvg);

    this.display
      .formatNumber(d3.format(".2f"))
      .valueAccessor(d => { return d.count ? (d.sum / ((d.count))) : 0 })
      .html({some: "<h4 class='info-box-text'><br>Average Oil Temperature</h4><h5 class='info-box-text'>%number °C</h5>"})
      .group(this.group);

		this.display.render();
	}
}
