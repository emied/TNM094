import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class AvgDurationDisplay
{
	constructor(cross_filter, container_id)
	{
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

		this.group = cross_filter.groupAll().reduce(reduceAddAvg('duration'), reduceRemoveAvg('duration'), reduceInitAvg);

		this.display
			.formatNumber(d3.format(".2f"))
			.valueAccessor(d => { return d.count ? ((d.sum / (d.count))/60) : 0 })
			.html({some: "<h4 class='info-box-text'><br>Average Trip Duration</h4><h5 class='info-box-text'>%number min</h5>"})
			.group(this.group);

		this.display.render();
	}

	redraw()
	{
		this.display.redraw();
	}
}
