
import { CompressorIdDashboard } from './compressor-dashboard/compressor-id-dashboard.js';

function startupDataRequest() {
	var dataset = 'compressor'; // should be set depending on dashboard/options
	var start = "2018-03-20";
	var end = "2019-03-28";
	var decimate = 1; // decimate value should be set depending on device


	// Request data from server using our API.
	var requestURL = '/api/data_range?dataset=' + dataset + '&start=' + start + "&end=" + end + "&decimate=" + decimate.toString();
	var request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
		// Check and display errors. There's probably a better way but this is just for testing.
		if (request.status != 200) {
			return;
		}

		var data = request.response;

		if(data.length == 0) {
			data_load_text.innerHTML += " No data satisfies the request."
			return;
		}

		var compressor = new CompressorIdDashboard(data);

		window.onresize = function(event) {
			compressor.resize();
		};
	}
}

$(document).ready(() => {
	startupDataRequest();
});
