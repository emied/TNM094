import { CompressorsDashboard } from './compressors-dashboard/compressors-dashboard.js';

function afterLoad() {

	socket.emit('dataset', { name: 'compressors' } );
	socket.on("compressors_data", data => {
		compressors_dashboard.addData(data);
	});

	window.onresize = function(event) {
		compressors_dashboard.resize();
	};
}

function startupDataRequest() {
	var mode = new URLSearchParams(window.location.search).get('mode');

	d3.json('./api/get_compressors').then( data => {
		d3.json('/api/get_file?name=kommuner-kustlinjer.geo.json').then( map_data => {
			compressors_dashboard = new CompressorsDashboard(data, map_data, mode);
			afterLoad();
		});
	});
}

$(document).ready(() => {
	startupDataRequest();
});