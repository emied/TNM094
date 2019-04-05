import { BikeDashboard } from './bike-dashboard/bike-dashboard.js';

function afterLoad() {
	const socket = io();
	socket.on("data", data => {
		bike_dashboard.addData(data);
	});

	window.onresize = function(event) {
		bike_dashboard.resize();
	};

	$('#map-hover-info').html('<a>&nbsp</a><br><a>&nbsp</a>');

	$('#map-chart').on("mouseenter", "g.zip_code", function(e) {
		var text = $(this).find('text').text().split('.');
		$('#map-hover-info').html('<a>ZIP code: ' + text[0] + '</a><br><a>Bike rides: ' + text[1] + '</a>');
	});

	$('#map-chart').on("mouseleave", "g.zip_code", function(e) {
		$('#map-hover-info').html('<a>&nbsp</a><br><a>&nbsp</a>');
	});
}

function startupDataRequest() {
	var dataset = 'bike';
	var interval = 30*60*1000; // 30 minutes

	fetch('./api/data_latest_range?dataset=' + dataset + '&interval=' + interval)
		.then(response => { 
			return response.json(); 
		})
		.then(data => {
			d3.csv('/api/get_file?name=bike_stations.csv').then(function(station_data) {
				d3.json('/api/get_file?name=san-francisco-zip-codes.geojson').then(function(map_data) {
					bike_dashboard = new BikeDashboard(data, map_data, station_data);
					afterLoad();
				});
			});
		});
}

startupDataRequest();
