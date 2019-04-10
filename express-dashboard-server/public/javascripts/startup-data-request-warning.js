function startupDataRequest() {
	var dataset = 'compressor1'; // should be set depending on dashboard/options
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
		if (request.status != 200)
		{
			return;
		}

		var data = request.response;

		if(data.length == 0)
		{
			return;
		}
		warnings(data);
	}
}
