export class MinutesChart
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.chart = dc.barChart(this.container_id);

		this.dimension = cross_filter.dimension(function(d) {
				var date = new Date(d.start_time);
				date.setMilliseconds(0);
				date.setSeconds(0);
				return date;
		});
		this.group = this.dimension.group().reduceCount();

		this.start = new Date(this.dimension.bottom(1)[0].start_time);
		this.end = new Date(this.dimension.top(1)[0].start_time);

		this.chart
			.width($(this.container_id).width())
			.height(height)
			.x(d3.scaleTime().domain([this.start, this.end]))
			.xUnits(d3.timeMinutes)
			.margins({left: 10, top: 10, right: 10, bottom: 30}) // Compensate for removed y-axis
			.yAxisLabel("")
			.elasticY(true)
			.elasticX(true)
			.xAxisPaddingUnit('second')
			.xAxisPadding(30)
			.centerBar(true)
			.dimension(this.dimension)
			.group(this.group)
			.colorAccessor(d => { return d.key; })
			.colors(d3.scaleTime().domain([this.start, this.end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

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
		var new_start = new Date(this.dimension.bottom(1)[0].start_time);
		var new_end = new Date(this.dimension.top(1)[0].start_time);

		this.start = new_start < this.start ? new_start : this.start;
		this.end = new_end > this.end ? new_end : this.end;

		this.chart
			//.x(d3.scaleTime().domain([this.start, this.end]))
			.colors(d3.scaleTime().domain([this.start, this.end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

		this.chart.redraw();
	}
}