import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class AvgOilPressureDisplay {

	constructor(cross_filter, container_id, avg_id, labelText) {
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

    this.group = cross_filter.groupAll().reduce(reduceAddAvg("oil_pressure"), reduceRemoveAvg("oil_pressure"), reduceInitAvg);

    this.display
      .formatNumber(d3.format(".2f"))
      .valueAccessor(d => { return d.count ? (d.sum / ((d.count))) : 0 })
      .html({some: "<h4 class=" + avg_id + "><br>" + labelText + " Oil Pressure</h4><h5 class=" + avg_id + ">%number bar</h5>"})
      .group(this.group);

		this.display.render();
	}
}
