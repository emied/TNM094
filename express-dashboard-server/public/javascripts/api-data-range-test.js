/****************************************************

api-data-range-test.js

Test code for making requests to the data_range API
and printing the results.

****************************************************/

var query_button = document.getElementById('api-query');
var individual_button = document.getElementById('api-individual');
var result_div = document.getElementById('result');

var request;

print_result = function() {
	result_div.innerHTML = "";

	if (request.status != 200)
	{
		result_div.innerHTML = "Error " + request.status.toString() + " " + request.statusText;
		if (request.response.hasOwnProperty('errors'))
		{
			result_div.innerHTML += ". Error list:<br><br>"
			for (var i = 0; i < request.response.errors.length; i++)
			{
				result_div.innerHTML += '- ' + request.response.errors[i].msg + '<br><br>';
			}
		}
		return;
	}
	var data = request.response;
	if(data.length == 0)
	{
		result_div.innerHTML += "No data satisfies the request."
		return;
	}
	result_div.innerHTML += data.length > 20 ? "Valid query, first 20 results:" : 'Valid query, results:';
	result_div.innerHTML += '<br><br>';
	
	for(var i = 0; i < data.length; i++)
	{
		if(i == 20) { break; }
		result_div.innerHTML += '- ' + data[i].start_time + '<br>';
	}
};


query_button.addEventListener('click', function() {

	var requestURL = '/api/data_range?' + document.getElementById('query').value;
	request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	request.onload = print_result;
});

individual_button.addEventListener('click', function() {
	var dataset = document.getElementById('dataset').value;
	var start = document.getElementById('start').value;
	var end = document.getElementById('end').value;
	var decimate = document.getElementById('decimate').value;
	
	var requestURL = '/api/data_range?dataset=' + dataset + '&start=' + start + "&end=" + end + "&decimate=" + decimate;
	request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'json';
	request.send();

	request.onload = print_result;
});

