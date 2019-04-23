import { BikeDashboard } from './bike-dashboard/bike-dashboard.js';

var data_load_text = document.getElementById('data-load');
data_load_text.innerHTML = "Status: Waiting for request.";

// For debugging
var decimate_slider = document.getElementById('decimate-slider');
noUiSlider.create(decimate_slider, {
	range: { min: 1, max: 64 },
	step: 1,
	tooltips: [{ to: function(v) { return Math.round(v); }}],
	start: 32
});

$(function filter() {
	$('input[name="daterange"]').daterangepicker({
		opens: 'right'
	}, function(start, end, label) {
		
		var dataset = 'bike';
		start = start.format('YYYY-MM-DD');
		end = end.format('YYYY-MM-DD');
		var decimate = Math.round(decimate_slider.noUiSlider.get());

		var t0 = performance.now();

		data_load_text.innerHTML = "Status: Requesting " + (100.0 - 100.0 / decimate).toFixed(2);
		data_load_text.innerHTML += "% reduced data between " + start + " and " + end + " from server...";

		var requestURL = '/api/data_range?dataset=' + dataset + '&start=' + start + "&end=" + end + "&decimate=" + decimate.toString();
		var request = new XMLHttpRequest();
		request.open('GET', requestURL);
		request.responseType = 'json';
		request.send();

		request.onload = function() {
			// Check and display errors. There's probably a better way but this is just for testing.
			if (request.status != 200)
			{
				data_load_text.innerHTML = "Status: Error " + request.status.toString() + " " + request.statusText + ".";
				if (request.response.hasOwnProperty('errors'))
				{
					data_load_text.innerHTML += " ";
					for (var i = 0; i < request.response.errors.length; i++)
					{
						data_load_text.innerHTML += "[" + request.response.errors[i].msg + "] ";
					}
				}
				return;
			}

			var data = request.response;

			var t1 = performance.now();
			data_load_text.innerHTML = "Status: Data loaded in " + (t1 - t0).toFixed(0) + " ms.";

			if(data.length == 0)
			{
				data_load_text.innerHTML += " No data satisfies the request."
				return;
			}

			d3.csv('/api/get_file?name=bike_stations.csv').then(function(station_data) {
				d3.json('/api/get_file?name=san-francisco-zip-codes.geojson').then(function(map_data) {
					bike_dashboard = new BikeDashboard(data, map_data, station_data);
				});
			});
		}
	});
});
