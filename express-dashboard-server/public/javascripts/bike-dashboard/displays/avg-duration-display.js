import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class AvgDurationDisplay
{
	constructor(cross_filter, container_id)
	{
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

		this.group = cross_filter.groupAll().reduce(
			function (p, v) {
				++p.count;
				p.sum_duration += +v.duration;

				return p;
			},
			function (p, v) {
				--p.count;
				p.sum_duration -= +v.duration;

				return p;
			},
			function () {
				return {
					count: 0,
					sum_duration: 0.0
				};
			}
		);

		this.display
			.formatNumber(d3.format(".2f"))
			.valueAccessor(d => { return d.count ? ((d.sum_duration / (d.count))/60) : 0 })
			.html({some: "<h4 class='info-box-text'><br>Average Trip Duration</h4><h5 class='info-box-text'>%number min</h5>"})
			.group(this.group);

		this.display.render();
	}

	redraw()
	{
		this.display.redraw();
	}
}
