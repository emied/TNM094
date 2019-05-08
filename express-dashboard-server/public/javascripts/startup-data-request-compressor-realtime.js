import { CompressorDashboard } from './compressor-dashboard/compressor-dashboard.js';

function startupDataRequest() {
	var interval = 1000*60*60*2;

	// Get id from url
	var id = new URLSearchParams(window.location.search).get('id');

	if(!id){
		id = 0;
		window.history.replaceState(null, null, window.location.pathname + window.location.search + "&id=" + id);
	}

	fetch('api/compressor_latest_range?id=' + id + '&interval=' + interval)
		.then( response => {
			return response.json();
		})
		.then( data => {
			if(data.hasOwnProperty('errors')) {
				throw JSON.stringify(data.errors);
			}

			compressor_dashboard = new CompressorDashboard(data);

			window.onresize = function(event) {
				compressor_dashboard.resize();
			};

			const socket = io();
			socket.emit('dataset', { name: 'compressor', id: id } );
			socket.on("compressor_data", data => {
				compressor_dashboard.addData(data);
			});

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
