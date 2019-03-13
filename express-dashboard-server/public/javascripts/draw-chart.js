/***************************************************

draw-chart.js

Prototype client code used for testing visualization
of data returned by the server.

Draws a simple bar chart that visualizes the daily
data point distribution over the time interval.

+ more

***************************************************/

const EARTH_RADIUS = 6371000;

function deg2rad(deg)
{
	return deg * Math.PI / 180.0;
}

function remove_empty_bins(source_group) {
  return {
    all: function() {
      return source_group.all().filter(function(d) {
        return d.value.count != 0;
      });
    }
  };
}

function drawChart(data) {
	var t1 = performance.now();
	d3.csv('/api/get_file?name=bike_stations.csv').then(function(station_data) {
		d3.json('/api/get_file?name=san-francisco-zip-codes.geojson').then(function(map_data) {

			// Filter out stations that we haven't assigned ZIP codes to yet
			bike_stations_zip = station_data.filter(station => { return station.zip != ""; });

			/********************************************************** 
			 For each bike ride, find the ZIP code of its start station
			 and remove data entry if none can be found.
			 Since we only use geo data with ZIP codes from SF currently,
			 every bike ride outside SF will be removed (Bay Area, San Jose)

			 This is pretty processing intensive. It's basically a tradeoff 
			 between bandwidth and processing (less data needs to be sent
			 but more processing needs to be done on that data). There
			 might me a better solution.

			 Update: 
			 This gives a 600% performance improvement compared to
			 the old method (at decimate=8). 

			 Now bike_stations.get(station id).zip (for example) is used 
			 to get specific data of a station.
			**********************************************************/

			var bike_stations = new Map();

			bike_stations_zip.forEach(station => {
				var obj = {lat: station.lat, lon: station.lon, zip: station.zip, name: station.name};
				bike_stations.set(station.id, obj);
			})

			// Filter out bike ride entries that starts in a station w/o ZIP code
			data = data.filter(d => { return bike_stations.get(d.start_id)});

			/********************************************** 
			Function that draws circles at station coordinates
			on the map chart. Called by the map chart each time
			it re-renders (i.e. when crossfilter changes).
			**********************************************/
			var projection; // this gets set further down in the map chart section.
			function drawStationDots(_chart, selection) 
			{
				//drawBikeRoute(_chart, selection);

				var svg = _chart.svg();

				var group = svg.selectAll("g.station_dots");

				// Create SVG circle elements for all stations.
				// This is only done once when the page first loads.
				if (group.empty()) {

					group = svg.append("g").classed("station_dots", true);

					var additional_nodes = group.selectAll("circle").data(bike_stations_zip, function(x) { return x.id; });

					additional_nodes.enter()
						.append("circle")
						.attr("x", 0)
						.attr("y", 0)
						.attr("r", 0)
						.attr("transform", function(d){ var v = projection([d.lon, d.lat]); return "translate(" + v[0] + "," + v[1] + ")"; })
						.style("opacity", 1.0)
						.style("fill", "white")
						.style("stroke", "black")
						.style("stroke-width", "0.1%")

					additional_nodes.exit().remove();
				}

				// Find stations selected with current crossfilter
				var filtered_stations = new Map();
				_chart.dimension().top(Infinity).map(function(d) {
					var station = bike_stations.get(d.start_id);
					if(station)
					{
						filtered_stations.set(d.start_id, station);
					}
				});

				// Loop through all SVG circle elements and set radius
				// to 3 or 0 depending on if the station should be visible
				// or not according to the filtered stations.
				// Also uses a variable transition duration to make
				// the radius animate in and out at different speeds.
				group.selectAll("circle").each(function(d, i) {
					if(filtered_stations.get(d.id))
					{
						d3.select(this)
							.transition().attr("r", 3.5).duration(i*10)
					}
					else
					{
						d3.select(this)
							.transition().attr("r", 0).duration(i*10)
					}
				});
			}

			var bike_id_group;
			function drawBikeRoute(_chart, selection) 
			{

				var svg = _chart.svg();
				//svg.selectAll("g.bike_id_path").remove();

				var group = svg.selectAll("g.bike_id_path");

				// Select the bike that has traveled the furthest distance to draw path for.
				selected_bike_id = bike_id_group.top(1)[0].key;

				if (group.empty()) {

					var bike_id_path = [];

					data.forEach( d => {
						if(d.bike_id == selected_bike_id)
						{
							var start_station = bike_stations.get(d.start_id);
							var end_station = bike_stations.get(d.end_id);

							if(start_station && end_station)
							{
								var s = projection([parseFloat(start_station.lon), parseFloat(start_station.lat)]);
								var e = projection([parseFloat(end_station.lon), parseFloat(end_station.lat)]);
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
						.attr("stroke-width", 1)
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
			}

			var cross_filter = crossfilter(data);
		
			var count_chart = dc.dataCount("#count-chart");

			/**********************************
				Date bar chart
			***********************************/
			var date_bar_chart = dc.barChart('#date-bar-chart');

			var day_dimension = cross_filter.dimension(function(d) {
				var date = new Date(d.start_time);
				date.setHours(0, 0, 0, 0);
				return date;
			});
			var day_group = day_dimension.group().reduceCount();

			var start = new Date(day_dimension.bottom(1)[0].start_time);
			var end = new Date(day_dimension.top(1)[0].start_time);
			
			/**********************************
				Bike id row chart
			***********************************/
			var bike_id_chart = dc.rowChart('#bike-id-chart');

			var bike_id_dimension = cross_filter.dimension(function(d) {
				return d.bike_id;
			});
		
			bike_id_group = bike_id_dimension.group().reduceSum( d => { return d.distance; });

			/***************************************************************
			Station coordinate scatter chart

			This scatter plot is basically a map but without geology lines.
			Should be possible to overlay the map.
		
			Blue dots = low activity
			Green dots = medium activity
			Orange dots = high activity
			***************************************************************/
			// var coordinate_scatter = dc.scatterPlot('#coordinate-scatter');

			// var start_coordinate_dimension = cross_filter.dimension(function(d) {
			// 	const max_lat = 37.88022244590679;
			// 	const min_lat = 37.330165;
		
			// 	var mid_lat = min_lat + (max_lat-min_lat)/2.0;
		
			// 	x = EARTH_RADIUS * deg2rad(d.lon) * Math.cos(deg2rad(mid_lat));
			// 	y = EARTH_RADIUS * deg2rad(d.lat);
		
			// 	return [x, y];
			// });
			// var start_coordinate_group = start_coordinate_dimension.group().reduceCount();
		
			// non_empty_start_coordinate_group = remove_empty_bins(start_coordinate_group);

			// var max_coord_count = Math.max.apply(Math, non_empty_start_coordinate_group.all().map(function(o) { return parseFloat(o.value); }));
			// var min_coord_count = Math.min.apply(Math, non_empty_start_coordinate_group.all().map(function(o) { return parseFloat(o.value); }));
			// var mid_coord_count = Math.round(min_coord_count + (max_coord_count - min_coord_count) / 2.0);
		
			// max_coord_count = Math.pow(max_coord_count, 1/8);
			// min_coord_count = Math.pow(min_coord_count, 1/8);
			// mid_coord_count = Math.pow(mid_coord_count, 1/8);
			
			/*************
				Pie chart
			*************/
			var pie_chart = dc.pieChart('#pie-chart');

			//hehe ugly solution
			var genderDimension = cross_filter.dimension(function(d) {
				var test;
				if (d.gender == 1) {
					test = "Male";
				}
				else if (d.gender == 2) {
					test = "Female";
				}
				else
					test = "Other"
		
				return test;
			});
			var genderGroup = genderDimension.group().reduceCount();

			/**************************************************************
			Map choropleth chart over ZIP code regions in SF. 

			Color corresponds to the amount of bike rides that start in the region.
		
			Gray = no bike rides (probably because there's no stations in region)
			Blue = medium activity
			Green = high activity
			***************************************************************/
			var map_chart = dc.geoChoroplethChart("#map-chart");

			var width = 415;
			var height = 415;

			var zip_dimension = cross_filter.dimension(function(d) {
				return bike_stations.get(d.start_id).zip;
			});
			var zip_group = zip_dimension.group().reduceCount();
			
			var center = d3.geoCentroid(map_data)
			var scale  = 100;
			var offset = [width/2, height/2];
			projection = d3.geoMercator().scale(scale).center(center).translate(offset);
			
			var path = d3.geoPath().projection(projection);

			// Temporary offset and scale to zoom in on interesting region.
			// The code would do this automatically if no-bike-station-zones are removed.
			var t_of = [-65, 65];
			var t_sc = 1.45; 
			
			var bounds  = path.bounds(map_data);
			var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
			var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
			var scale   = (hscale < vscale) ? hscale : vscale;
			var offset  = [width - (bounds[0][0] + bounds[1][0])/2 + t_of[0], height - (bounds[0][1] + bounds[1][1])/2 + t_of[1]];
			
			projection = d3.geoMercator().center(center).scale(scale*t_sc).translate(offset);
			path = path.projection(projection);

			var max_zip = Math.max.apply(Math, zip_group.all().map(function(o) { return parseFloat(o.value); }));
			var min_zip = Math.min.apply(Math, zip_group.all().map(function(o) { return parseFloat(o.value); }));
			var mid_zip = min_zip + (max_zip - min_zip) / 2.0;

			max_zip = Math.pow(max_zip, 1/8);
			min_zip = Math.pow(min_zip, 1/8);
			mid_zip = Math.pow(mid_zip, 1/8);

			/*******************
			Chart configurations
			*******************/
			map_chart
				.dimension(zip_dimension)
				.group(zip_group)
				.width(width)
				.height(height)
				.colors(d3.scaleLinear().domain([0, mid_zip, max_zip]).interpolate(d3.interpolateLab).range(['lightgray', "#0cb1e6", '#2ac862']))
				//.colors(d3.scaleLinear().domain([0, max_zip]).interpolate(d3.interpolateLab).range(['lightgray', '#0cb1e6']))

				// This value is weird
				.colorAccessor(function(d) { return d ? Math.pow(d, 1/8) : 0; })

				/* Comment out this line to remve dots. */
				.on("renderlet", drawStationDots)

				.projection(projection)
				.overlayGeoJson(map_data["features"], "zip_code", function (d) {
					return d.properties.zip_code;
				})
				.title(function (p) {
					return "ZIP code: " + p.key + ". Bike rides: " + (p.value ? p.value : "0");
				});
		
			// coordinate_scatter
			// 	.width(400)
			// 	.height(400)
			// 	.dimension(start_coordinate_dimension)
			// 	.group(non_empty_start_coordinate_group)
		
			// 	.colorAccessor(function(d) {
			// 		return Math.pow(d.value, 1/8);
			// 	})
		
			// 	.colors(d3.scaleLinear().domain([min_coord_count, mid_coord_count, max_coord_count]).interpolate(d3.interpolateLab).range(['#0cb1e6', "#2ac862", '#e09950']))
		
			// 	.symbolSize(6)
		
			// 	.margins({left: 0, top: 0, right: 0, bottom: 0}) // Compensate for removed axes
		
			// 	.x(d3.scaleLinear().domain([4195000, 4210000]))
			// 	.y(d3.scaleLinear().domain([-10790000, -10765000]))
		
			// 	.elasticY(true)
			// 	.elasticX(true)

			// 	// 1 kilometer padding
			// 	.yAxisPadding(1000)
			// 	.xAxisPadding(1000)
		
			// 	.renderHorizontalGridLines(true)
			// 	.renderVerticalGridLines(true)
		
			// 	.renderLabel(true)
			// 	.label(function(p) {
			// 	  return p.value;
			// 	});
		
			date_bar_chart
				.width(700)
				.height(150)
				.x(d3.scaleTime().domain([start, end]))
				.round(d3.timeDay.round)
				.xUnits(d3.timeDays)
				.margins({left: 10, top: 10, right: 10, bottom: 30}) // Compensate for removed y-axis
				.yAxisLabel("")
				.elasticY(true)
				.elasticX(false)
				.dimension(day_dimension)
				.group(day_group)
				.colorAccessor(function(d) {
					return d.key;
				})
				.colors(d3.scaleTime().domain([start, end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));
		
			bike_id_chart
				.width(400)
				.height(250)
				.group(bike_id_group)
				.dimension(bike_id_dimension)
				// Not possible to remove x-axis for this chart via css for whatever reason.
				// This works but it's ugly
				.margins({left: 30, top: 10, right: 50, bottom: -1}) 
				.rowsCap(5)
				.othersGrouper(false)
				.label(function(d) {
					return 'Bike ID: ' + d.key + ", Distance: " + Math.round(d.value/1000.0) + " km";
				})
				.title(function(d) {
				  return null;
				})
				.elasticX(true)
				.xAxis().ticks(3);
		
			pie_chart
				.width(250)
				.height(250)
				.dimension(genderDimension)
				.group(genderGroup)
				.on('renderlet', function(chart) {
					chart.selectAll('rect').on('click', function(d) {
						console.log('click!', d);
					});
				});
		
			count_chart
				.dimension(cross_filter)
				.group(cross_filter.groupAll());
		
			/*********
			FLYTTA PIECHART FUNKTION - KANSKE ONÖDIG ----
		
			//Call dragElement
			dragElement(document.getElementById("pie-chart"));
		
			function dragElement(elmnt) {
			  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
			  if (document.getElementById(elmnt)) {
		
			    // if present, the header is where you move the DIV from:
			    document.getElementById(elmnt).onmousedown = dragMouseDown;
			  }
				else {
			    // otherwise, move the DIV from anywhere inside the DIV:
			    elmnt.onmousedown = dragMouseDown;
			  }
		
				function dragMouseDown(e) {
			  e = e || window.event;
			  e.preventDefault();
			  // get the mouse cursor position at startup:
			  pos3 = e.clientX;
			  pos4 = e.clientY;
			  document.onmouseup = closeDragElement;
			  // call a function whenever the cursor moves:
			  document.onmousemove = elementDrag;
				}
		
				function elementDrag(e) {
			  e = e || window.event;
			  e.preventDefault();
			  // calculate the new cursor position:
			  pos1 = pos3 - e.clientX;
			  pos2 = pos4 - e.clientY;
			  pos3 = e.clientX;
			  pos4 = e.clientY;
			  // set the element's new position:
			  elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			  elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
				}
		
				function closeDragElement() {
			  	// stop moving when mouse button is released:
			  	document.onmouseup = null;
			  	document.onmousemove = null;
				}
			}
		
			*********************************/

			/******************
			Average speed display
			******************/
			var avg_speed_display = dc.numberDisplay("#info-box-1");

			var avg_speed_group = cross_filter.groupAll().reduce(
				function (p, v) {
					++p.count;
					p.sum_speed += +v.speed;

					return p;
				},
				function (p, v) {
					--p.count;
					p.sum_speed -= +v.speed;

					return p;
				},
				function () { 
					return {
						count: 0,
						sum_speed: 0.0
					}; 
				}
			);

			avg_speed_display
				.formatNumber(d3.format(".2f"))
				.valueAccessor(d => { return d.count ? (d.sum_speed / (d.count)) : 0 })
				.html({some: "<h4 class='info-box-text'><br>Average Speed</h4><h5 class='info-box-text'>%number km/h</h5>"})
				.group(avg_speed_group);

			/******************
			Total distance display
			******************/
			var tot_dist_display = dc.numberDisplay("#info-box-2");

			var tot_dist_group = cross_filter.groupAll().reduceSum( d => { return d.distance; });

			tot_dist_display
				.formatNumber(d3.format(".2f"))
				.valueAccessor(d => { return d/1000.0 })
				.html({some: "<h4 class='info-box-text'><br>Total Distance</h4><h5 class='info-box-text'>%number km</h5>"})
				.group(tot_dist_group);

			/******************
			Unique bikes display
			******************/
			var unique_bikes_display = dc.numberDisplay("#info-box-3");

			var unique_bikes_group = cross_filter.groupAll().reduce(
				function(p, v)
				{ 
					const count = p.bikes.get(v.bike_id) ||  0;
					p.bikes.set(v.bike_id, count + 1);
					return p;
				},

				function(p,v) 
				{ 
					const count = p.bikes.get(v.bike_id);
					if (count === 1) 
					{
						p.bikes.delete(v.bike_id);
					} 
					else 
					{
						p.bikes.set(v.bike_id, count - 1);
					}
					return p;
				},

				function() 
				{ 
					return { bikes: new Map() };
				}
			);

			unique_bikes_display
				.formatNumber(d3.format(".0f"))
				.html({some: "<h4 class='info-box-text'><br>Unique Bikes Used</h4><h5 class='info-box-text'>%number</h5>"})
				.group(unique_bikes_group)
				.valueAccessor( d => { return d.bikes.size } );

			/******************
			Average duration display
			******************/
			var avg_duration_display = dc.numberDisplay("#info-box-4");

			var avg_duration_group = cross_filter.groupAll().reduce(
				function (p, v) {
					++p.count;
					p.sum_duration += +v.duration;

					return p;
				},
				function (p, v) {
					--p.count;
					p.sum_duration -= +v.duration;

					return p;
				},
				function () { 
					return {
						count: 0,
						sum_duration: 0.0
					}; 
				}
			);

			avg_duration_display
				.formatNumber(d3.format(".2f"))
				.valueAccessor(d => { return d.count ? (d.sum_duration / (d.count)) : 0 })
				.html({some: "<h4 class='info-box-text'><br>Average Trip Duration</h4><h5 class='info-box-text'>%number sec</h5>"})
				.group(avg_duration_group);
			
			dc.renderAll();

			// Super ugly solution but prevents this from showing before chart is loaded.
			document.getElementById('t1').innerHTML = " bike rides out of ";
			document.getElementById('t2').innerHTML = " selected. | ";
			document.getElementById('t3').innerHTML = " Reset All";
		
			document.getElementById("map-chart").style.border = "1px solid black";

			//document.getElementById("coordinate-scatter").style.border = "1px solid black";

			var t2 = performance.now();
			data_load_text.innerHTML += " Indexed and drawn in " + (t2-t1).toFixed(0) + " ms.";
		});
	});
}
