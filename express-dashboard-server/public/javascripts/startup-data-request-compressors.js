import { CompressorsDashboard } from './compressors-dashboard/compressors-dashboard.js';

function afterLoad() {
	// const socket = io();
	// socket.on("data", data => {
	// 	bike_dashboard.addData(data);
	// });

	window.onresize = function(event) {
		compressors_dashboard.resize();
	};
}

function startupDataRequest() {
	d3.json('./api/get_compressors').then( data => {
		d3.json('/api/get_file?name=sweden-counties.geojson').then( map_data => {
			compressors_dashboard = new CompressorsDashboard(data, map_data);
			afterLoad();
		});
	});
}

$(document).ready(() => {
	startupDataRequest();
});