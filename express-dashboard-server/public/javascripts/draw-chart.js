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
	var coordinate_scatter = dc.scatterPlot('#coordinate-scatter');
	var date_bar_chart = dc.barChart('#date-bar-chart');
	var bike_id_chart = dc.rowChart('#bike-id-chart');
	var pie_chart = dc.pieChart('#pie-chart');
	var count_chart = dc.dataCount("#count-chart");

	var cross_filter = crossfilter(data);

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
		/*
			bottom left: 37.6772094,-122.5738362
			top right: 37.9070985,-122.2201624
		*/
		var lat = parseFloat(d.start_lat);
		var lon = parseFloat(d.start_lon);

		if(lat < 37.6772094 || lat > 37.9070985 || lon > -122.2201624 || lon < -122.5738362)
		{
			return null;
		}

		/* max/min lat can be computed with:
			 Math.max.apply(Math, data.map(function(o) { return parseFloat(o.start_lat); })); */
		const max_lat = 37.88022244590679;
		const min_lat = 37.312854042932614;

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

	coordinate_scatter
		.width(400)
		.height(400)
		.dimension(start_coordinate_dimension)
		.group(non_empty_start_coordinate_group)

		.colorAccessor(function(d) {
		   return d.value;
		})

		.symbolSize(4)

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
		  return null;
		});

	date_bar_chart
		.width(1100)
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
}
