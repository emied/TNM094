export class StatusChart 
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.chart = dc.pieChart(this.container_id);

		this.dimension = cross_filter.dimension(function(d) {
			switch(d.status)
			{
				case 0: return 'Working'; break;
				case 1: return 'Warning'; break;
				case 2: return 'Broken'; break;
				default: return 'Working';
			}
		});
		this.group = this.dimension.group().reduceCount();

		this.chart
			.width($(this.container_id).width())
			.height(height)
			.dimension(this.dimension)
			.group(this.group);

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