/**********************************************************************

api-controller.js

Does all request processing for API calls. This involves checking if
the request query is valid and then creating and sending the response.

Check exports.data_range for commented example.

req = Request, res = Response

**********************************************************************/

var datasets = require('../data/datasets').datasets;
var compressors = require('../data/datasets').compressors;

const { check, validationResult } = require('express-validator/check');

var debug_range = require('debug')('dashboard:api:data_range');

/***********************************************
Validates HTTP requests for different API calls.
***********************************************/
exports.validate = function(method) {
	switch (method) {
		case 'data_range':
			{
				return [
					check('dataset')
						.exists()
						.withMessage('dataset parameter is required.')
						.isAlpha()
						.withMessage('dataset needs to be an alphabetical string.')
						.custom( dataset => { return datasets.hasOwnProperty(dataset) ? dataset : Promise.reject(); })
						.withMessage("Requested dataset doesen't exist on server."),

					check('start')
						.exists()
						.withMessage('start parameter is required.')
						.isISO8601({strict: true})
						.withMessage("Invalid start date formatting, or start date can't exist (e.g. 52:th of may).")
						.toDate(),

					check('end')
						.exists()
						.withMessage('end parameter is required.')
						.isISO8601({strict: true})
						.withMessage("Invalid end date formatting, or end date can't exist (e.g. 42:th of january).")
						.custom( (end, { req }) => { return new Date(req.query.start) < new Date(end) ? end : Promise.reject(); })
						.withMessage("Start date needs to happen before end date.")
						.toDate(),

					check('decimate')
						.exists()
						.withMessage('decimate parameter is required.')
						.isInt({ min: 1 })
						.withMessage('decimate needs to be a positive integer.')
						.toInt()
				]
			}

		case 'get_compressor':
			{
				return [
					check('id')
						.exists()
						.withMessage('id parameter is required.')
						.isInt({ min: 0 })
						.withMessage("compressor id's are integers equal to or larger than 0")
						.custom( id => {
							/***************************************************
							Id's are just the array index. In the general case 
							you would need to loop through compressors and check. 
							***************************************************/
							return id < require('../data/constants.js').COMPRESSORS.NUM && id >= 0;
						})
						.withMessage("Requested compressor id doesen't exist on server."),

					check('start')
						.exists()
						.withMessage('start parameter is required.')
						.isISO8601({strict: true})
						.withMessage("Invalid start date formatting, or start date can't exist (e.g. 52:th of may).")
						.toDate(),

					check('end')
						.exists()
						.withMessage('end parameter is required.')
						.isISO8601({strict: true})
						.withMessage("Invalid end date formatting, or end date can't exist (e.g. 42:th of january).")
						.custom( (end, { req }) => { return new Date(req.query.start) < new Date(end) ? end : Promise.reject(); })
						.withMessage("Start date needs to happen before end date.")
						.toDate(),

					check('decimate')
						.exists()
						.withMessage('decimate parameter is required.')
						.isInt({ min: 1 })
						.withMessage('decimate needs to be a positive integer.')
						.toInt()
				]
			}
	}
};

/************************************
Displays list of available API calls
************************************/
exports.list = function(req, res) {
	res.send('Implement API list');
};

/***************************************
Returns range of decimated historic data
***************************************/
exports.data_range = function(req, res) {
	debug_range( req.query );

	// Check if request is valid, respond with error if not.
	// Uses the exports.validate function from above to determine this.
	const errors = validationResult(req);
	if (!errors.isEmpty())
	{
		// Send error status code 400 and the array of errors as response if the request was invalid.
		res.status(400).json({ errors: errors.array() });
		return;
	}

	// Get the requested parameters from the query
	var { dataset, start, end, decimate } = req.query;

	data = datasets[dataset]; // Use requested dataset

	// Improve performance when getting data from the most interesting time interval.
	// An index table for each day, week and month is probably a good idea.
	var i = 0;
	if(start >= new Date('2018-11-03 00:00:00'))
	{
		i = 1458603;
	}

	// Accumulate all data entries that satisfies the request and store in result.
	// Will only work for data sorted by start_time in ascending order, check data/datasets.js.
	var result = [];
	for ( ; i < data.length; i += decimate)
	{
		var date = new Date(data[i].start_time);
		if (date >= start)
		{
			if (date > end)
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

	debug_range(result.length + ' entries sent');
};

/***************************************************
Returns basic information about all compressors
TODO: Maybe send some more info about operation status,
average flow and such. Also maybe add some filtering
options (not sure what would be suitable).
***************************************************/
exports.get_compressors = function(req, res) {

	var result = [];
	compressors.forEach( c => {
		result.push({
			id: c.id,
			lat: c.lat,
			lon: c.lon,
		});
	});

	res.json(result)
};

/*********************************************************************
Returns decimated historic compressor data for specific compressor ID.
*********************************************************************/
exports.get_compressor = function(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty())
	{
		res.status(400).json({ errors: errors.array() });
		return;
	}

	var { id, start, end, decimate } = req.query;

	const formatDate = require('../data/utility.js').formatDate;

	var c = compressors[id];

	var result = { 
		id: c.id,
		lat: c.lat,
		lon: c.lon,
		start_time: [],
		flow: [],
		bearing_vibration: [],
		oil_pressure: [],
		oil_temp: [],
		ambient_temp: [],
		humidity: [] 
	}
	
	for(var i = 4300 + c.index_offset; i < (datasets['compressor'].length - c.index_offset); i += decimate) {
		
		var start_time = new Date(new Date(datasets['compressor'][i].start_time).valueOf() + c.start_time_offset)

		if(start_time > start)
		{
			if(start_time > end)
			{
				break;
			}

			result.start_time.push(formatDate(start_time));

			var v = datasets['compressor'][i];

			result.flow.push(+v.flow + c.flow_offset);
			result.bearing_vibration.push(+v.bearing_vibration + c.bearing_vibration_offset);
			result.oil_pressure.push(+v.oil_pressure + c.oil_pressure_offset);
			result.oil_temp.push(+v.oil_temp + c.oil_temp_offset);
			result.ambient_temp.push(+v.ambient_temp + c.ambient_temp_offset);
			result.humidity.push(+v.humidity + c.humidity_offset);
		}
	}

	res.json(result)
}

/***************************************
Returns range of historic data up until
the current internal time. I.e. it can
handle requests like 'send all data for 
the last week'. Usefull for initial data
request when using real-time data.
***************************************/
exports.data_latest_range = function(req, res) {
	var { dataset, interval } = req.query;

	var data = datasets[dataset];
	var start = new Date(global.data_current_time.valueOf() - interval);

	var result = [];
	for (var i = global.current_index; i >= 0; i--)
	{
		var date = new Date(data[i].start_time);
		if(date >= start)
		{
			result.push(data[i]);
		}
		else
		{
			break;
		}
	}
	res.json(result);
}

/***************************************
Returns specified data file.
Really unsafe, implement validation.
***************************************/
exports.get_file = function(req, res) {
	res.download('data/source/' + req.query.name);
	
}
