export class MapChart
{
	constructor(cross_filter, container_id, height, map_data)
	{
		this.container_id = container_id;
		this.dimension = cross_filter.dimension(function(d) { return d.lon + ',' + d.lat; });
		this.group = this.dimension.group().reduceCount();

		this.chart = dc_leaflet.markerChart(this.container_id)
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value)
			.width($(this.container_id).width())
			.height(height)
			.center([42.69,25.42])
			.zoom(7)
			.renderPopup(false)
			.filterByArea(true)

		this.chart.render()
	}
}