export class MapChartCluster
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.dimension = cross_filter.dimension(function(d) { return d.lon + ',' + d.lat; });
		this.group = this.dimension.group().reduceCount();
		this.height = height;

		this.chart = dc_leaflet.markerChart(this.container_id)
			.mapOptions({ zoomSnap: 0.1 }) 
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value)
			.width($(this.container_id).width())
			.height(this.height)
			.center([63,18])
			.zoom(4.6)
			.cluster(true);

		this.chart.render()
	}

	resize()
	{
		// Normal resize doesn't work for leaflet map.
		// This seems to work but it's slow, there's probably a better way.

		this.chart.map().off();
		this.chart.map().remove();
		this.chart.resetSvg();

		$(this.container_id).html('');

		this.chart = dc_leaflet.markerChart(this.container_id)
			.mapOptions({ zoomSnap: 0.1 }) 
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value)
			.width($(this.container_id).width())
			.height(this.height)
			.center([63,18])
			.zoom(4.6)
			.cluster(true);

		this.chart.render()
	}
}