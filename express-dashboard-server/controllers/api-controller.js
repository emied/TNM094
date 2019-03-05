/**********************************************************************

api-controller.js

Does all request processing for API calls. This involves checking if
the request query is valid and then creating and sending the response.

Check exports.data_range for commented example.

req = Request, res = Response

**********************************************************************/

var d3 = require('d3');
var datasets = require('../data/datasets');

const { check, validationResult } = require('express-validator/check');

/***********************************************
Validates HTTP requests for different API calls.
***********************************************/
exports.validate = function(method) {
	switch (method) {
		case 'data_range':
			{
				return [
					check('dataset', "dataset doesn't exist").exists(),
					check('start', "start doesen't exist").exists(),
					check('end', "end doesen't exist").exists(),
					check('decimate', "decimate doesen't exist").exists()
				]
			}
	}
};

/************************************
Displays list of available API calls
************************************/
exports.list = function(req, res) {
	res.send('NOT IMPLEMENTED: API list');
};

/***************************************
Returns range of decimated historic data
***************************************/
exports.data_range = function(req, res) {

	// Check if request is valid, respond with error if not.
	const errors = validationResult(req);
	if (!errors.isEmpty())
	{
		// Send error status code 400 and the array of errors as response if the request was invalid.
		// (The function will terminate here because a response is sent and this can only be done once)
		res.status(400).json({ errors: errors.array() });
	}

	var date_format_parser = d3.timeParse(d3.timeFormat('%Y-%m-%d %H:%M:%S'));

	// Get the requested parameters from the query (req.query)
	var dataset = req.query.dataset; // string name of dataset
	var start = date_format_parser(req.query.start);
	var end = date_format_parser(req.query.end);
	var decimate = +req.query.decimate;

	var data = datasets[dataset]; // Use requested dataset

	// Accumulate all data entries that satisfies the request and store in result.
	var result = [];
	for (var i = 0; i < data.length; i += decimate)
	{
		var date = date_format_parser('2018-' + data[i].start_time);
		if (date >= start)
		{
			if (date >= end)
			{
				break;
			}
			else
			{
				result.push(data[i]);
			}
		}
	}
	res.json(result); // Send the accumulated data as response in JSON.
};
