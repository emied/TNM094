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

		var start = new Date(this.dimension.bottom(1)[0].start_time);
		var end = new Date(this.dimension.top(1)[0].start_time);

		// Normal chart with date units has weird padding when there are only few bars.
		// Using ordinal for now.
		this.chart
			.width($(this.container_id).width())
			.height(height)
			.x(d3.scaleBand())
			.xUnits(dc.units.ordinal)
			.margins({left: 10, top: 10, right: 10, bottom: 30}) // Compensate for removed y-axis
			.yAxisLabel("")
			.elasticY(true)
			.elasticX(true)
			.dimension(this.dimension)
			.group(this.group)
			.colorAccessor(d => { return d.key; })
			.colors(d3.scaleTime().domain([start, end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

		this.chart.xAxis().tickFormat(d => {  var f = d3.format('02d'); return f(d.getHours()) + ":" + f(d.getMinutes()); });

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
			.colors(d3.scaleTime().domain([start, end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

		this.chart.redraw();
	}
}