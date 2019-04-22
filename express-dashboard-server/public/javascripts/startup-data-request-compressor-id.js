
import { CompressorIdDashboard } from './compressor-dashboard/compressor-id-dashboard.js';

function startupDataRequest() {
	var id = 100; 
	var start = "2018-03-20";
	var end = "2020-03-28";
	var decimate = 1;

	d3.json('api/get_compressor?id=' + id + '&start=' + start + '&end=' + end + '&decimate=' + decimate).then( data => {
		var compressor_id_dashboard = new CompressorIdDashboard(data);

		window.onresize = function(event) {
			compressor_id_dashboard.resize();
		};

	});
}

$(document).ready(() => {
	startupDataRequest();
});
