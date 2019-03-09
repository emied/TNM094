/***************************************************

draw-chart.js

Prototype client code used for testing visualization
of data returned by the server.

Draws a simple bar chart that visualizes the daily
data point distribution over the time interval.

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
	d3.csv('/api/get_file?name=bike_stations.csv').then(function(station_data) {

		bike_stations = station_data.filter(station => { return station.zip != ""; });

		for(var i = data.length - 1; i >= 0; i--) {
    	var station = bike_stations.find(s => { return s.id == data[i].start_id });

    	if(station)
			{
				data[i].start_lat = station.lat;
				data[i].start_lon = station.lon;
				data[i].zip = station.zip;
			}
			else
			{
      	data.splice(i, 1);
			}
		}

		var cross_filter = crossfilter(data);
	
		/**************************************************************
		This scatter plot is basically a map but without geology lines.
		It should be possible to use a geological map so this is just a
		placeholder until we figure that out.
	
		Blue dots = low activity
		Green dots = medium activity
		Orange dots = high activity
		***************************************************************/
		var coordinate_scatter = dc.scatterPlot('#coordinate-scatter');
	
		var date_bar_chart = dc.barChart('#date-bar-chart');
		var bike_id_chart = dc.rowChart('#bike-id-chart');
		var pie_chart = dc.pieChart('#pie-chart');
		var count_chart = dc.dataCount("#count-chart");
	
		var day_dimension = cross_filter.dimension(function(d) {
			var date = new Date(d.start_time);
			date.setHours(0, 0, 0, 0);
			return date;
		});
		var day_group = day_dimension.group().reduceCount();
	
		var bike_id_dimension = cross_filter.dimension(function(d) {
			return d.bike_id;
		});
	
		var bike_id_group = bike_id_dimension.group().reduce(
  	  function(p, v) {
  	    p.sum_distance += +v.distance;
  	    return p;
  	  },
	
  	  function(p, v) {
  	    p.sum_distance -= +v.distance;
  	    return p;
  	  },
	
  	  function() {
  	    return {
  	      sum_distance: 0.0
  	    };
  	  }
  	);
	
		var start_coordinate_dimension = cross_filter.dimension(function(d) {
			var lat = parseFloat(d.start_lat);
			var lon = parseFloat(d.start_lon);
	
			const max_lat = 37.88022244590679;
			const min_lat = 37.330165;
	
			var mid_lat = min_lat + (max_lat-min_lat)/2.0;
	
			x = EARTH_RADIUS * deg2rad(lon) * Math.cos(deg2rad(mid_lat));
			y = EARTH_RADIUS * deg2rad(lat);
	
			return [x, y];
		});
		var start_coordinate_group = start_coordinate_dimension.group().reduceCount();
	
		non_empty_start_coordinate_group = remove_empty_bins(start_coordinate_group);
	
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
	
		var start = new Date(day_dimension.bottom(1)[0].start_time);
		var end = new Date(day_dimension.top(1)[0].start_time);
	
		var max_coord_count = Math.max.apply(Math, non_empty_start_coordinate_group.all().map(function(o) { return parseFloat(o.value); }));
		var min_coord_count = Math.min.apply(Math, non_empty_start_coordinate_group.all().map(function(o) { return parseFloat(o.value); }));
		var mid_coord_count = Math.round(min_coord_count + (max_coord_count - min_coord_count) / 2.0);
	
		max_coord_count = Math.pow(max_coord_count, 1/8);
		min_coord_count = Math.pow(min_coord_count, 1/8);
		mid_coord_count = Math.pow(mid_coord_count, 1/8);
	
		coordinate_scatter
			.width(400)
			.height(400)
			.dimension(start_coordinate_dimension)
			.group(non_empty_start_coordinate_group)
	
			.colorAccessor(function(d) {
				return Math.pow(d.value, 1/8);
			})
	
			.colors(d3.scaleLinear().domain([min_coord_count, mid_coord_count, max_coord_count]).interpolate(d3.interpolateLab).range(['#0cb1e6', "#2ac862", '#e09950']))
	
			.symbolSize(6)
	
			.margins({left: 0, top: 0, right: 0, bottom: 0}) // Compensate for removed axes
	
			.x(d3.scaleLinear().domain([4195000, 4210000]))
			.y(d3.scaleLinear().domain([-10790000, -10765000]))
	
			.elasticY(true)
			.elasticX(true)
			.yAxisPadding(1000)
			.xAxisPadding(1000)
	
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
	
			.renderLabel(true)
			.label(function(p) {
			  return p.value;
			});
	
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
			.ordering(function(d) {
  	    return -d.value.sum_distance;
  	  })
			.valueAccessor(function(d) {
  	    return d.value.sum_distance;
  	  })
			.rowsCap(5)
			.othersGrouper(false)
			.label(function(d) {
  	    return 'Bike ID: ' + d.key + ", Distance: " + Math.round(d.value.sum_distance/1000.0) + " km";
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
	
	
	
		d3.json('/api/get_file?name=san-francisco-zip-codes.geojson').then(function(map_data) {
	
			var map_chart = dc.geoChoroplethChart("#map-chart");
			var width = 400;
			var height = 400;
	
			var map_props_data = [];
			for(var i = 0; i < map_data.features.length; i++)
			{
				map_props_data.push({ zip_code: map_data.features[i].properties.zip_code, 
					pop10_sqmi: map_data.features[i].properties.pop10_sqmi });
			}
	
			var map_cross_filter = crossfilter(map_props_data);
	
			var zip_dimension = map_cross_filter.dimension(function(d) {
				return d.zip_code;
			});
			var pop_group = zip_dimension.group().reduceSum(function(d) {
  	  	return d.pop10_sqmi;
  	  });
	
  	  var max_pop = Math.max.apply(Math, pop_group.all().map(function(o) { return parseFloat(o.value); }));
			var min_pop = Math.min.apply(Math, pop_group.all().map(function(o) { return parseFloat(o.value); }));
	
			var center = d3.geoCentroid(map_data)
  		var scale  = 100;
  		var offset = [width/2, height/2];
  		var projection = d3.geoMercator().scale(scale).center(center).translate(offset);
	
  		var path = d3.geoPath().projection(projection);
	
  		var bounds  = path.bounds(map_data);
  		var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
  		var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
  		var scale   = (hscale < vscale) ? hscale : vscale;
  		var offset  = [width - (bounds[0][0] + bounds[1][0])/2, height - (bounds[0][1] + bounds[1][1])/2];
	
  		projection = d3.geoMercator().center(center).scale(scale).translate(offset);
  		path = path.projection(projection);
	
  		map_chart
				.dimension(zip_dimension)
				.group(pop_group)
				.width(width)
				.height(height)
				.colors(d3.scaleLinear().domain([min_pop,max_pop]).interpolate(d3.interpolateLab).range(['#222222', '#dddddd']))
				.projection(projection)
				.overlayGeoJson(map_data["features"], "zip_code", function (d) {
					return d.properties.zip_code;
				})
				.title(function (p) {
					return "Test";
				});
	
			map_chart.render();
			document.getElementById("map-chart").style.border = "1px solid black";
		});
	
	
		dc.renderAll();
	
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
	
		// Super ugly solution but prevents this from showing before chart is loaded.
		document.getElementById('t1').innerHTML = " bike rides out of ";
		document.getElementById('t2').innerHTML = " selected. | ";
		document.getElementById('t3').innerHTML = " Reset All";
	
		document.getElementById("coordinate-scatter").style.border = "1px solid black";

	});
}
