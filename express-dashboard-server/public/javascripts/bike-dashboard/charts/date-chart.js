export class DateChart
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.chart = dc.barChart(this.container_id);

		this.dimension = cross_filter.dimension(function(d) {
				var date = new Date(d.start_time);
				date.setHours(0, 0, 0, 0);
				return date;
		});
		this.group = this.dimension.group().reduceCount();

		var start = new Date(this.dimension.bottom(1)[0].start_time);
		var end = new Date(this.dimension.top(1)[0].start_time);

		this.chart
			.width($(this.container_id).width())
			.height(height)
			.x(d3.scaleTime().domain([start, end]))
			.round(d3.timeDay.round)
			.xUnits(d3.timeDays)
			.margins({left: 10, top: 10, right: 10, bottom: 30}) // Compensate for removed y-axis
			.yAxisLabel("")
			.elasticY(true)
			.elasticX(false)
			.dimension(this.dimension)
			.group(this.group)
			.colorAccessor(d => { return d.key; })
			.colors(d3.scaleTime().domain([start, end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

		this.chart.render();
	}

	resize()
	{
		this.chart
			.width($(this.container_id).width())
			.transitionDuration(0);

		this.chart.render();

		this.chart.transitionDuration(750);
	}

	redraw()
	{
		var start = new Date(this.dimension.bottom(1)[0].start_time);
		var end = new Date(this.dimension.top(1)[0].start_time);

		this.chart
			.x(d3.scaleTime().domain([start, end]))
			.colors(d3.scaleTime().domain([start, end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

		this.chart.redraw();
	}
}