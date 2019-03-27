class MapChart
{
	constructor(cross_filter, container_id, map_data, bike_stations)
	{
		this.map_data = map_data;

		this.container_id = '#' + container_id;
		this.chart = dc.geoChoroplethChart(this.container_id);
		
		this.dimension = cross_filter.dimension(function(d) {
			return bike_stations.get(d.start_id).zip;
		});
		this.group = this.dimension.group().reduceCount();
		
		this.width = $(this.container_id).width();
		this.height = 400;
		
		var max_zip = Math.max.apply(Math, this.group.all().map(function(o) { return parseFloat(o.value); }));
		var min_zip = Math.min.apply(Math, this.group.all().map(function(o) { return parseFloat(o.value); }));
		var mid_zip = min_zip + (max_zip - min_zip) / 2.0;
		
		max_zip = Math.pow(max_zip, 1/8);
		min_zip = Math.pow(min_zip, 1/8);
		mid_zip = Math.pow(mid_zip, 1/8);
		
		this.calculate_projection();
		
		this.chart
			.dimension(this.dimension)
			.group(this.group)
			.width(this.width)
			.height(this.height)
			.colors(d3.scaleLinear().domain([0, mid_zip, max_zip]).interpolate(d3.interpolateLab).range(['lightgray', "#0cb1e6", '#2ac862']))
			.colorAccessor(function(d) { return d ? Math.pow(d, 1/8) : 0; }) // This value is weird
			.projection(this.projection)
			.overlayGeoJson(this.map_data["features"], "zip_code", function (d) {
				return d.properties.zip_code;
			})
			.title(function (p) {
				return "ZIP code: " + p.key + ". Bike rides: " + (p.value ? p.value : "0");
			});

		this.chart.render();
	}

	calculate_projection()
	{
		var center = d3.geoCentroid(this.map_data)
		var scale  = 100;
		var offset = [this.width/2, this.height/2];

		this.projection = d3.geoMercator().scale(scale).center(center).translate(offset);
		
		var path = d3.geoPath().projection(this.projection);

		// Temporary offset and scale to zoom in on interesting region.
		// The code would do this automatically if no-bike-station-zones are removed.
		var t_of = [-65, 65];
		var t_sc = 1.45; 
		
		var bounds  = path.bounds(this.map_data);
		var hscale  = scale*this.width  / (bounds[1][0] - bounds[0][0]);
		var vscale  = scale*this.height / (bounds[1][1] - bounds[0][1]);
		var scale   = (hscale < vscale) ? hscale : vscale;
		var offset  = [this.width - (bounds[0][0] + bounds[1][0])/2 + t_of[0], this.height - (bounds[0][1] + bounds[1][1])/2 + t_of[1]];
		
		this.projection = d3.geoMercator().center(center).scale(scale*t_sc).translate(offset);
	}

	resize()
	{
		this.width = $(this.container_id).width();

		this.calculate_projection();

		this.chart
			.width(this.width)
			.projection(this.projection)
			.transitionDuration(0);

		this.chart.render();

		this.chart.transitionDuration(750);
	}
}