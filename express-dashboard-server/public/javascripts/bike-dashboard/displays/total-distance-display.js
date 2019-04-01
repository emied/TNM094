class TotalDistanceDisplay
{
	constructor(cross_filter, container_id)
	{
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

		this.group = cross_filter.groupAll().reduceSum( d => { return d.distance; });

		this.display
			.formatNumber(d3.format(".2f"))
			.valueAccessor(d => { return d/1000.0 })
			.html({some: "<h4 class='info-box-text'><br>Total Distance</h4><h5 class='info-box-text'>%number km</h5>"})
			.group(this.group);

		this.display.render();
	}
}
