/***************************************************

draw-chart.js

Prototype client code used for testing visualization
of data returned by the server.

Draws a simple bar chart that visualizes the daily
data point distribution over the time interval.

***************************************************/

function drawChart(data) {
	var date_format_parser = d3.timeParse(d3.timeFormat('%Y-%m-%d %H:%M:%S'));

	var date_bar_chart = dc.barChart('#date-bar-chart');
	var count_chart = dc.dataCount("#count-chart");
	var pie_chart = dc.pieChart('#pie-chart');

	var cross_filter = crossfilter(data);

	var day_dimension = cross_filter.dimension(function(d) {
		var date = date_format_parser('2018-' + d.start_time);
		date.setHours(0, 0, 0, 0);
		return date;
	});
	day_group = day_dimension.group().reduceCount();

	var start = date_format_parser('2018-' + day_dimension.bottom(1)[0].start_time);
	var end = date_format_parser('2018-' + day_dimension.top(1)[0].start_time);

	date_bar_chart
		.width(750)
		.height(150)
		.x(d3.scaleTime().domain([start, end]))
		.round(d3.timeDay.round)
		.xUnits(d3.timeDays)
		.yAxisLabel("")
		.elasticY(true)
		.elasticX(false)
		.dimension(day_dimension)
		.group(day_group)
		.colorAccessor(function(d) {
			return d.key;
		})
		.colors(d3.scaleTime().domain([start, end]).interpolate(d3.interpolateHcl).range(["#3fb8af", "#0088cc"]));

		//hehe ugly solution
		var genderDimension = cross_filter.dimension(function(data) {
			if (data.gender == 1) {
				test = "Male";
			}
			else if (data.gender == 2) {
				test = "Female";
			}
			else
				test = "Other"

			return test;
		});

		var genderGroup = genderDimension.group().reduceCount();

		pie_chart
			.width(300)
			.height(300)
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


	// Super ugly solution but prevents this from showing before chart is loaded.
	document.getElementById('t1').innerHTML = " bike rides out of ";
	document.getElementById('t2').innerHTML = " selected. | ";
	document.getElementById('t3').innerHTML = " Reset All";

}
