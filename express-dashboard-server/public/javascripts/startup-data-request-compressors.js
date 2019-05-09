import { CompressorsDashboard } from './compressors-dashboard/compressors-dashboard.js';

function afterLoad() {

	const socket = io();
	socket.emit('dataset', { name: 'compressors' } );
	socket.on("compressors_data", data => {
		compressors_dashboard.addData(data);
	});

	socket.on("statuses", statuses => {
		console.log(statuses);
	});

	window.onresize = function(event) {
		compressors_dashboard.resize();
	};
}

function startupDataRequest() {
	d3.json('./api/get_compressors').then( data => {
		d3.json('/api/get_file?name=kommuner-kustlinjer.geo.json').then( map_data => {
			compressors_dashboard = new CompressorsDashboard(data, map_data);
			afterLoad();
		});
	});
}

$(document).ready(() => {
	startupDataRequest();
});