import { BikeDashboard } from './bike-dashboard/bike-dashboard.js';

function afterLoad() {
	const socket = io();

	socket.emit('dataset', { name: 'bike' } );

	socket.on("bike_data", data => {
		bike_dashboard.addData(data);
	});

	window.onresize = function(event) {
		bike_dashboard.resize();
	};


	$('#map-hover-info').html('<a>&nbsp</a><br><a>&nbsp</a>');

	const regionInfo = (_this) => {
		var info = $(_this).find('region-info').text().split(','), text;

		text = '<a class=first>ZIP code: ' + info[0] + '</a>';
		text += '</a><a>Bike rides: ' + info[1] + '</a><br>';
		text += '<a class=first>Area:&nbsp&nbsp&nbsp&nbsp&nbsp' + d3.format(".3n")(info[3]) + ' km<sup>2</sup></a>';
		text += '<a>Population: ' + d3.format(",")(info[2]) + '</a>';

		$('#map-hover-info').html(text);
	}

	// TODO: call when bike_dashboard triggers new data event instead of using interval
	var interval;
	$('#map-chart').on("mouseenter", "g.zip_code", function(e) {
		regionInfo(this);
		interval = setInterval(() => { if(this) { regionInfo(this); } }, 500);
	});

	$('#map-chart').on("mouseleave", "g.zip_code", function(e) {
		$('#map-hover-info').html('<a>&nbsp</a><br><a>&nbsp</a>');
		clearInterval(interval);
	});
}

function startupDataRequest() {
	var dataset = 'bike';
	var interval = 30*60*1000; // 30 minutes

	d3.json('./api/data_latest_range?dataset=' + dataset + '&interval=' + interval).then( data => {
		d3.csv('/api/get_file?name=bike_stations.csv').then( station_data => {
			d3.json('/api/get_file?name=san-francisco-zip-codes.geojson').then( map_data => {
				bike_dashboard = new BikeDashboard(data, map_data, station_data);
				afterLoad();
			});
		});
	});
}

$(document).ready(() => {
	startupDataRequest();
});
