export class BikeIdChart
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.chart = dc.rowChart(this.container_id);
		this.dimension = cross_filter.dimension( d => { return d.bike_id; });
		this.group = this.dimension.group().reduceSum( d => { return d.distance; });

		this.chart
			.width($(this.container_id).width())
			.height(height)
			.group(this.group)
			.dimension(this.dimension)
			.margins({left: 30, top: 10, right: 50, bottom: -1}) // hide axes
			.rowsCap(5)
			.othersGrouper(false)
			.label( d => { return 'Bike ID: ' + d.key + ", Distance: " + Math.round(d.value/1000.0) + " km"; })
			.title( d => { return null; })
			.elasticX(true)
			.xAxis().ticks(3);

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
		this.chart.redraw();
	}
}