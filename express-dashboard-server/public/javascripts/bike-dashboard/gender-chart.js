class GenderChart 
{
	constructor(cross_filter, container_id)
	{
		this.container_id = '#' + container_id;
		this.chart = dc.pieChart(this.container_id);

		this.dimension = cross_filter.dimension(function(d) {
			if (d.gender == 1) {
				return "Male";
			}
			if (d.gender == 2) {
				return "Female";
			}
			else {
				return "Other"
			}
		});
		this.group = this.dimension.group().reduceCount();

		this.chart
			.width($(this.container_id).width())
			.height(240)
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
}