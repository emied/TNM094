import { BikeDashboard } from './bike-dashboard/bike-dashboard.js';

window.onresize = function(event) {
	bike_dashboard.resize();
};

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
				});
			});
		});
}

startupDataRequest();

const socket = io();
socket.on("data", data => {
	if(bike_dashboard) {
		bike_dashboard.addData(data);
	} 
});