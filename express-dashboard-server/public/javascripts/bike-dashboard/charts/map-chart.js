export class MapChart
{
	constructor(cross_filter, container_id, height, map_data, bike_stations, data, selected_bike_id)
	{
		this.map_data = map_data;

		this.container_id = container_id;
		this.chart = dc.geoChoroplethChart(this.container_id);

		this.bike_stations = bike_stations;

		this.dimension = cross_filter.dimension(function(d) {
			return 'a' + bike_stations.get(d.start_id).zip;
		});
		this.group = this.dimension.group().reduceCount();

		this.width = $(this.container_id).width();
		this.height = height;

		this.max_zip = Math.max.apply(Math, this.group.all().map(function(o) { return parseFloat(o.value); }));
		this.min_zip = Math.min.apply(Math, this.group.all().map(function(o) { return parseFloat(o.value); }));
		var mid_zip = this.min_zip + (this.max_zip - this.min_zip) / 2.0;

		this.cf = d => Math.pow(d, 1/2);

		this.calculateProjection();

		// d3.scaleSequential(d3.interpolateYlOrRd).domain([0, this.cf(this.max_zip)])

		this.chart
			.dimension(this.dimension)
			.group(this.group)
			.width(this.width)
			.legend(dc.legend().x(this.width - 60).y(60).itemHeight(18).gap(1))
			.height(this.height)
			.colors(d3.scaleLinear().domain([0, this.cf(mid_zip), this.cf(this.max_zip)]).interpolate(d3.interpolateLab).range(['lightgray', "#008c82", '#74bc6e']))
			.colorAccessor( d => { return d ? this.cf(d) : 0; }) // This value is weird
			.projection(this.projection)
			.overlayGeoJson(this.map_data["features"], "zip_code", function (d) {
				return 'a' + d.properties.zip_code;
			})
			.title(() => { return null; });

		this.chart.legendables = function() {
			var items, seen = [];
			items = this.data().filter(x => { return seen[x.value] ? false : (seen[x.value] = true) });
			items = items.sort((a,b) => { return b.value - a.value });

			var chart = this;
			return items.map( d => {
				return {
					chart: chart,
					name: d.value,
					color: chart.getColor(d.value)
				};
			})
		};

		/****************************************************************
		Awkward method of adding the custom event driven render functions
		as class methods with some kind of access to members in the 'this'
		scope. Might be a better way with '.apply()' or '.call()'.
		****************************************************************/
		this.drawStationDots();
		this.drawBikeRoute(data, selected_bike_id);

		this.show_dots = true;
		this.show_route = true;
		this.show_used_stations = true;

		this.chart.render();
	}

	resize()
	{
		this.width = $(this.container_id).width();

		this.calculateProjection();

		this.chart
			.width(this.width)
			.projection(this.projection)
			.legend(dc.legend().x(this.width - 60).y(60).itemHeight(18).gap(1))
			.transitionDuration(0);

		this.chart.render();

		this.chart.transitionDuration(750);
	}

	redraw(new_data)
	{
		this.new_data = new_data;
		this.chart.redraw();
	}

	calculateProjection()
	{
		var center = d3.geoCentroid(this.map_data);
		var scale  = 100;
		var offset = [this.width/2, this.height/2];

		this.projection = d3.geoMercator().scale(scale).center(center).translate(offset);

		var path = d3.geoPath().projection(this.projection);

		// // Temporary offset and scale to zoom in on interesting region.
		// // The code would do this automatically if no-bike-station-zones are removed.
		var t_of = [-65, 65];
		var t_sc = 1.45;

		var bounds  = path.bounds(this.map_data);
		var hscale  = scale*this.width  / (bounds[1][0] - bounds[0][0]);
		var vscale  = scale*this.height / (bounds[1][1] - bounds[0][1]);
		var scale   = (hscale < vscale) ? hscale : vscale;
		var offset  = [this.width - (bounds[0][0] + bounds[1][0])/2 + t_of[0], this.height - (bounds[0][1] + bounds[1][1])/2 + t_of[1]];

		this.projection = d3.geoMercator().center(center).scale(scale*t_sc).translate(offset);
	}

	drawStationDots()
	{
		/* Shallow copy of 'this' so that it
		can be used in the chart.on(...) scope */
		var map_chart = this;

		this.chart.on("preRedraw", function(_chart) {
			/* Rescale map colors */
			map_chart.max_zip = Math.max.apply(Math, map_chart.group.all().map(function(o) { return parseFloat(o.value); }));
			map_chart.min_zip = Math.min.apply(Math, map_chart.group.all().map(function(o) { return parseFloat(o.value); }));
			var mid_zip = map_chart.min_zip + (map_chart.max_zip - map_chart.min_zip) / 2.0;
			map_chart.chart.colors(d3.scaleLinear().domain([0, map_chart.cf(mid_zip), map_chart.cf(map_chart.max_zip)]).interpolate(d3.interpolateLab).range(['lightgray', "#008c82", '#74bc6e']));
		});

		this.chart.on("pretransition", function(_chart) {
			/* Add text attribute to map regions with info */

			var current = new Map();
			_chart.data().forEach(d => { current.set(d.key, d.value); })

			map_chart.map_data.features.forEach( d => {
				var region = _chart.select('g.zip_code.' + 'a' + d.properties.zip_code);
				if(region.select('region-info').empty())
				{
					region.append('region-info');
				}

				var value = current.get('a' + d.properties.zip_code);
				var text = d.properties.zip_code + ',' + (value ? value : '0') + ',' + d.properties.pop2010 + ',' +  (+d.properties.sqmi*2.58998811).toFixed(2);
				region.select('region-info').text(text);

				//Add/remove gray border depending on if region has bike-rides.
				if(value) {
					region.style("stroke", '#707070').style("stroke-width", "0.08%");
				}
				else {
					region.style("stroke-width", '0');
				}
			})

			/* The actual drawStationDots */
			var svg = _chart.svg();

			var group = svg.selectAll("g.station_dots");

			// Create SVG circle elements for all stations.
			// This is only done once when the page first loads.
			if (group.empty()) {

				group = svg.append("g").classed("station_dots", true);

				var additional_nodes = group.selectAll("circle").data(Array.from(map_chart.bike_stations), function(x) { return x[0]; });

				additional_nodes.enter()
					.append("circle")
					.attr("x", 0)
					.attr("y", 0)
					.attr("r", 0)
					.attr("transform", function(d){ var v = map_chart.projection([d[1].lon, d[1].lat]); return "translate(" + v[0] + "," + v[1] + ")"; })
					.style("opacity", 1.0)
					.style("fill", "white")
					.style("stroke", "black")
					.style("stroke-width", "0.1%")

				additional_nodes.exit().remove();
			}

			// Find stations selected with current crossfilter
			var filtered_stations = new Map();
			_chart.dimension().top(Infinity).map(function(d) {
				var station = map_chart.bike_stations.get(d.start_id);
				if(station)
				{
					filtered_stations.set(d.start_id, station);
				}
			});

			// Find recently active stations (from the latest streamed data).
			var used_stations = new Map();
			if(map_chart.show_used_stations && map_chart.new_data)
			{
				map_chart.new_data.forEach( d => {
					var station = map_chart.bike_stations.get(d.start_id);
					if(station)
					{
						used_stations.set(d.start_id, station);
					}
				});
			}

			// Loop through all SVG circle elements and set radius
			// to 3 or 0 depending on if the station should be visible
			// or not according to the filtered stations.
			// Also uses a variable transition duration to make
			// the radius animate in and out at different speeds.

			var new_count = 0;
			//const color = '#ff775f';
			const color = '#ff957d'
			const f = x => { return Math.pow((x/used_stations.size), 1/2)*550 };

			group.selectAll("circle").each(function(d, i) {
				if(filtered_stations.get(d[0]))
				{
					if(used_stations.get(d[0]))
					{
						new_count++;
						var t0 = d3.select(this).raise().transition().duration(f(new_count)).ease(d3.easeQuadInOut);
						t0.attr("r", 6).style("fill", color).style("stroke-width", "0.15%");
						var t1 = t0.transition().duration(f(new_count)).ease(d3.easeQuadInOut);
						t1.attr("r", 3.5).style("fill", "white").style("stroke-width", "0.1%");
					}
					else
					{
						d3.select(this)
							.style("stroke-width", "0.1%")
							.style("fill", "white")
							.transition().attr("r", 3.5).duration(i*10)
					}
				}
				else
				{
					d3.select(this)
						.transition().attr("r", 0).duration(i*10)
				}
			});
		})
	}

	drawBikeRoute(data, selected_bike_id)
	{
		var map_chart = this;

		this.chart.on("renderlet", function(_chart) {
			var svg = _chart.svg();

			var group = svg.selectAll("g.bike_id_path");

			if (group.empty()) {
				var bike_id_path = [];
				data.forEach( d => {
					if(d.bike_id == selected_bike_id)
					{
						var start_station = map_chart.bike_stations.get(d.start_id);
						var end_station = map_chart.bike_stations.get(d.end_id);

						if(start_station && end_station)
						{
							var s = map_chart.projection([parseFloat(start_station.lon), parseFloat(start_station.lat)]);
							var e = map_chart.projection([parseFloat(end_station.lon), parseFloat(end_station.lat)]);
							bike_id_path.push({x: s[0], y: s[1]});
							bike_id_path.push({x: e[0], y: e[1]});
						}
					}
				});

				group = svg.append("g").classed("bike_id_path", true);

				var lineFunction = d3.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.curve(d3.curveLinear);

				var path = group.append("path")
					.attr("d", lineFunction(bike_id_path))
					.attr("stroke", "white")
					.attr("stroke-width", 0.5)
					.attr("fill", "none");

				var totalLength = path.node().getTotalLength();

				path
					.attr("stroke-dasharray", totalLength + " " + totalLength)
					.attr("stroke-dashoffset", totalLength)
					.transition()
						.duration(totalLength)
						.ease(d3.easeCubicIn)
						.attr("stroke-dashoffset", 0);
			}
		})
	}

	toggleStationDots()
	{
		this.show_dots = !this.show_dots;
		d3.selectAll("g.station_dots").style("opacity", +this.show_dots);
	}

	toggleBikeRoute()
	{
		this.show_route = !this.show_route;
		d3.selectAll("g.bike_id_path").style("opacity", +this.show_route);
	}

	toggleShowNewStations()
	{
		this.show_used_stations = !this.show_used_stations;
	}
}
