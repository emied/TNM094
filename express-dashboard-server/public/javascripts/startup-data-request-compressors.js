import { CompressorsDashboard } from './compressors-dashboard/compressors-dashboard.js';

function afterLoad() {
	// const socket = io();
	// socket.on("data", data => {
	// 	bike_dashboard.addData(data);
	// });

	// window.onresize = function(event) {
	// 	bike_dashboard.resize();
	// };
}

function startupDataRequest() {
	var start = "2018-09-19 08:55:00";
	var end = "2018-09-19 08:56:00";
	var decimate = 1;
	d3.json('./api/compressors_range?start=' + start + '&end=' + end + "&decimate=" + decimate).then( data => {
		d3.json('/api/get_file?name=sweden-counties.geojson').then( map_data => {
			compressors_dashboard = new CompressorsDashboard(data, map_data);
			afterLoad();
		});
	});
}

$(document).ready(() => {
	startupDataRequest();
});