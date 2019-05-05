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
			(p,v) => { p.id = v.id; p.status = v.status; return p; },
			(p,v) => { p.id = v.id; p.status = v.status; return p; },
			() => { return { id: -1, status: 0 } }
		);

		this.compressorView = e => {
			window.location.href = "dashboard?data=compressor&view=compressor&id=" + e.target.compressor_id;
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
				var icon_url;
				switch(d.value.status)
				{
					case 0:
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
						break;
					case 1:
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png';
						break;
					case 2: 
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
						break;
					default:
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
				}
				var icon = new L.Icon({
					iconUrl: icon_url,
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
				})
				var marker = new L.Marker(this.chart.toLocArray(this.chart.locationAccessor()(d)), {icon: icon}).on('click', this.compressorView);
				marker.compressor_id = d.value.id;
				return marker;
			})
			.rebuildMarkers(true)
			.cluster(true);

		this.chart.render();
	}

	resize()
	{
		// Normal resize doesn't work for leaflet map.
		// This seems to work but it's slow, there's probably a better way.

		var center = this.chart.map().getCenter();
		var zoom = this.chart.map().getZoom();

		this.chart.map().off();
		this.chart.map().remove();
		this.chart.resetSvg();

		$(this.container_id).html('');

		this.chart = dc_leaflet.markerChart(this.container_id)
			.mapOptions({ zoomSnap: 0.1 }) 
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value.id)
			.width($(this.container_id).width())
			.height(this.height)
			.center([center.lat,center.lng])
			.zoom(zoom)
			.renderPopup(false)
			.marker((d,map) => {
				var icon_url;
				switch(d.value.status)
				{
					case 0:
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
						break;
					case 1:
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png';
						break;
					case 2: 
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
						break;
					default:
						icon_url = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
				}
				var icon = new L.Icon({
					iconUrl: icon_url,
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
				})
				var marker = new L.Marker(this.chart.toLocArray(this.chart.locationAccessor()(d)), {icon: icon}).on('click', this.compressorView);
				marker.compressor_id = d.value.id;
				return marker;
			})
			.rebuildMarkers(true)
			.cluster(true);

		this.chart.render()
	}

	redraw()
	{
		// This is the only thing that will redraw the map
		this.resize();
	}
}