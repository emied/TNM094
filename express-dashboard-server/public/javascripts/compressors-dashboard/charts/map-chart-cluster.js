export class MapChartCluster
{
	constructor(cross_filter, container_id, height, map_data)
	{
		this.container_id = container_id;
		this.dimension = cross_filter.dimension(function(d) { console.log(d.lon + "," + d.lat); return d.lon + ',' + d.lat; });
		this.group = this.dimension.group().reduceCount();

		this.chart = dc_leaflet.markerChart(this.container_id)
			.mapOptions({ zoomSnap: 0.1 }) 
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value)
			.width($(this.container_id).width())
			.height(height)
			.center([63,18])
			.zoom(4.6)
			.cluster(true);

		this.chart.render()
	}
}