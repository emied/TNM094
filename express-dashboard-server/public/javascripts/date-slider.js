var date_slider = document.getElementById('date-slider');
var data_load_text = document.getElementById('data-load');
data_load_text.innerHTML = "Status: Waiting for request.";

function zeroPad(number) {
	return number < 10 ? 0 + number.toString() : number;
}

function formatDate(date) {
	return zeroPad(date.getFullYear()) + "-" + zeroPad(date.getMonth() + 1) + "-" + zeroPad(date.getDate());
}

function timestamp(str) {
	return new Date(str).getTime();
}

noUiSlider.create(date_slider, {
    range: {
        min: timestamp('2018-01-01'),
        max: timestamp('2018-12-31')
    },

    step: 24 * 60 * 60 * 1000,		// 1 day slider steps
    margin: 24 * 60 * 60 * 1000, 	// minimum of 1 day interval
    connect: [false, true, false],

    tooltips: [{ to: function(v) { return formatDate(new Date(+v)); }}, 
		{ to: function(v) { return formatDate(new Date(+v)); }} ],

    start: [timestamp('2018-04-01'), timestamp('2018-09-01')]
});

var set_date_button = document.getElementById('set-date');

set_date_button.addEventListener('click', function () {
	var start = formatDate(new Date(+date_slider.noUiSlider.get()[0]));
	var end = formatDate(new Date(+date_slider.noUiSlider.get()[1]));
	var decimate = 32; // decimate value should be set depending on device

	data_load_text.innerHTML = "Status: Requesting " + (100.0-100.0/decimate).toFixed(2);
	data_load_text.innerHTML += "% reduced data between " + start + " and " + end + " from server...";

	start += "+00:00:00";
	end += "+23:59:59";

	var t0 = performance.now();

	// Request data from server
	var requestURL = '/data_api/get_range?start=' + start + "&end=" + end + "&decimate=" + decimate.toString(); 
	var request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	request.onload = function() {
  		var data = request.response;

  		var t1 = performance.now();

  		data_load_text.innerHTML = "Status: Data loaded in " + (t1-t0).toFixed(0) + " ms.";

  		drawChart(data);
	}
});
