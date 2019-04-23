import { CompressorIdDashboard } from './compressor-dashboard/compressor-id-dashboard.js';

function startupDataRequest() {
	var start = "2018-04-03";
	var end = "2019-04-21";
	var decimate = 1;

	// Get id from url
	var id = new URLSearchParams(window.location.search).get('id');
	
	id = id ? id : 0;

	d3.json('api/get_compressor?id=' + id + '&start=' + start + '&end=' + end + '&decimate=' + decimate).then( data => {
		var compressor_id_dashboard = new CompressorIdDashboard(data);

		window.onresize = function(event) {
			compressor_id_dashboard.resize();
		};
	}, error => {
		console.error(error)
		// Make default request or something
	})
}

$(document).ready(() => {
	startupDataRequest();
});
