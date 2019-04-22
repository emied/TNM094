export class MapChartCluster
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.height = height;
		this.dimension = cross_filter.dimension(function(d) { return d.lon + ',' + d.lat; });

		// Using dc.js / crossfilter in this instance doesn't make much sense. 
		// Better to just use leaflet directly, but we might need dc.leaflet for choropleth etc. later.
		this.group = this.dimension.group().reduce(
			(p,v) => { p.id = v.id; return p; },
			(p,v) => { p.id = v.id; return p; },
			() => { return { id: -1 } }
		);

		function compressorView(e) {
			window.location.href = "dashboard?data=compressor&view=compressor-id&id=" + e.target.compressor_id;
		}

		this.chart = dc_leaflet.markerChart(this.container_id)
			.mapOptions({ zoomSnap: 0.1 }) 
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value.id)
			.width($(this.container_id).width())
			.height(this.height)
			.center([63,18])
			.zoom(4.6)
			.renderPopup(false)
			.marker((d,map) => {
				var marker = new L.Marker(this.chart.toLocArray(this.chart.locationAccessor()(d))).on('click', compressorView);
				marker.compressor_id = d.value.id;
				return marker;
			})
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