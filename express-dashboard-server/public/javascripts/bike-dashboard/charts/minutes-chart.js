export class MinutesChart
{
	constructor(cross_filter, container_id, height, date_range)
	{
		this.container_id = container_id;
		this.chart = dc.barChart(this.container_id);
		this.date_range = date_range;

		this.dimension = cross_filter.dimension(function(d) {
				var date = new Date(d.start_time);
				date.setMilliseconds(0);
				date.setSeconds(0);
				return date;
		});
		this.group = this.dimension.group().reduceCount();

		this.chart
			.width($(this.container_id).width())
			.height(height)
			.x(d3.scaleTime().domain([this.date_range.start, this.date_range.end]))
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
			.colors(d3.scaleTime().domain([this.date_range.start, this.date_range.end]).interpolate(d3.interpolateHcl).range(["#2ac8bc", "#0882aa"]));

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
		this.chart
			.colors(d3.scaleTime().domain([this.date_range.start, this.date_range.end]).interpolate(d3.interpolateHcl).range(["#2ac8bc", "#0882aa"]));

		this.chart.redraw();
	}
}
