export class MapChartCluster
{
	constructor(cross_filter, container_id, height)
	{
		this.container_id = container_id;
		this.height = height;

		this.dimension = cross_filter.dimension(function(d) { return d.lon + ',' + d.lat; });

		this.group = this.dimension.group().reduce(
			(p,v) => { p.id = v.id; p.status = v.status; p.count = 1; return p; },
			(p,v) => { p.id = v.id; p.status = v.status; p.count = 0; return p; },
			() => { return { id: -1, status: 0, count: 0 } }
		);

		this.compressorView = e => {
			window.location.href = "dashboard?data=compressor&view=compressor&id=" + e.target.compressor_id;
		}

		this.createMap();

		this.chart.render();
	}

	createMap()
	{
		var color = d3.scaleLinear().domain([0, 100]).interpolate(d3.interpolateLab).range(['rgba(0,140,130,0.6)', 'rgba(116,188,110,0.6)']);
		var color_i = d3.scaleLinear().domain([0, 100]).interpolate(d3.interpolateLab).range(['rgba(0,140,130,1.0)', 'rgba(116,188,110,1.0)']);

		const color_f = num => {
			return num > 150 ? color(150) : color(num);
		}

		const color_i_f = num => {
			return num > 150 ? color_i(150) : color_i(num);
		}

		this.chart = dc_leaflet.markerChart(this.container_id)
			.mapOptions({ zoomSnap: 0.1 }) 
			.dimension(this.dimension)
			.group(this.group)
			.valueAccessor(d => d.value.count)
			.width($(this.container_id).width())
			.height(this.height)
			.center([63,18])
			.zoom(4.6)
			.renderPopup(false)
			.clusterOptions({
				iconCreateFunction: function(cluster) {
					var num = +cluster.getChildCount();
					var html = "<div class=custom-cluster-icon style='background-color:" + color_f(num) + ";'><div class=custom-cluster-inner-icon style='background-color:" + color_i_f(num) + ";'><span>" + cluster.getChildCount() + "</span></div></div>";
					return new L.DivIcon({
						html: html,
						className: 'bullshit',
						iconSize: [40, 40],
						iconAnchor: [20, 20]
					});
				}
			})
			.marker((d,map) => {
				var icon_url;
				var icon_path = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-';
				switch(d.value.status)
				{
					case 0:
						icon_url = icon_path + 'blue.png';
						break;
					case 1:
						icon_url = icon_path + 'yellow.png';
						break;
					case 2: 
						icon_url = icon_path + 'red.png';
						break;
					default:
						icon_url = icon_path + 'blue.png';
				}
				var icon = new L.Icon({
					iconUrl: icon_url,
					shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
					iconSize: [25, 41],
					shadowSize: [41, 41],
					iconAnchor: [12, 41]
				})
				var marker = new L.Marker(this.chart.toLocArray(this.chart.locationAccessor()(d)), {icon: icon}).on('click', this.compressorView);
				marker.compressor_id = d.value.id;
				return marker;
			})
			.rebuildMarkers(true)
			.cluster(true);
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

		this.createMap();

		this.chart.render()
	}

	redraw()
	{
		this.chart.redraw();
	}
}