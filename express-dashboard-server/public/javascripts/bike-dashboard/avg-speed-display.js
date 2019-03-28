
class AvgSpeedDisplay
{
	constructor(cross_filter, container_id)
	{
		this.container_id = '#' + container_id;
		this.display = dc.numberDisplay(this.container_id);

		this.group = cross_filter.groupAll().reduce(
			function (p, v) {
				++p.count;
				p.sum_speed += +v.speed;

				return p;
			},
			function (p, v) {
				--p.count;
				p.sum_speed -= +v.speed;

				return p;
			},
			function () {
				return {
					count: 0,
					sum_speed: 0.0
				};
			}
		);

		this.display
			.formatNumber(d3.format(".2f"))
			.valueAccessor(d => { return d.count ? (d.sum_speed / (d.count)) : 0 })
			.html({some: "<h4 class='info-box-text'><br>Average Speed</h4><h5 class='info-box-text'>%number km/h</h5>"})
			.group(this.group);

		this.display.render();
	}
}
