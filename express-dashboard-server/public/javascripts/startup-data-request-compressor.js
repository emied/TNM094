import { CompressorDashboard } from './compressor-dashboard/compressor-dashboard.js';

function startupDataRequest() {
	var start = "2018-04-03";
	var end = "2019-04-21";
	var decimate = 1;

	// Get id from url
	var id = new URLSearchParams(window.location.search).get('id');

	if(!id){
		id = 0;
		window.history.replaceState(null, null, window.location.pathname + window.location.search + "&id=" + id);
	}

	fetch('api/get_compressor?id=' + id + '&start=' + start + '&end=' + end + '&decimate=' + decimate)
		.then( response => {
			return response.json();
		})
		.then( data => {
			if(data.hasOwnProperty('errors')) {
				throw JSON.stringify(data.errors);
			}

			d3.json('./api/get_compressor_limits').then( limits => {
				var compressor_dashboard = new CompressorDashboard(data, limits);
			});

			window.onresize = function(event) {
				compressor_dashboard.resize();
			};
		})
		.catch( error => {
			$(document.body).html('<h1>Invalid Request</h1>');
			
			console.error(error);
			var errors = JSON.parse(error);
			
			errors.forEach( (e,i) => {
				$(document.body).append('<br><h4>Error ' + (i+1) + ':</h4>');
				Object.entries(e).forEach( ([key, value]) => {
					$(document.body).append('<h5>' + key + ': ' + value + '</h5>');
				});
			})
		})
}

$(document).ready(() => {
	startupDataRequest();
});
