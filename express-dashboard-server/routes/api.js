/**********************************************************************************************************************

api.js

Handles all routes for API calls, i.e. when an URL with the pattern http://localhost:3000/api is requested.

The API mostly uses the GET request method, which means that the query string is appended to the URL.
For example, if you want to request data with the following properties:

dataset=bike
start=2018-04-01 00:00:00
end=2018-09-01 23:59:59
decimate=256

Then make the following GET request:
http://localhost:3000/api/data_range?dataset=bike&start=2018-04-01+00:00:00&end=2018-09-01+23:59:59&decimate=256

(by for example opening the URL in a browser or calling it via javascript)
The server will then respond with the specified data in JSON.

The API could respond with empty JSON data if the request is valid but no data satisfies it. For example
if bike rides for a specific time period is requested, but no bike rides happened in that time period.
The client needs to check if the response data is empty and then act accordingly.

This file only specifies the different routes and then forwards the requests to functions in api-controller.js.

**********************************************************************************************************************/

var express = require('express');
var router = express.Router();

var api_controller = require('../controllers/api-controller');

/*************************************************************************************
Defines what should happen when http://localhost:3000/api is requested with method GET.
Displays a list of all available API calls.
*************************************************************************************/
router.get('/', api_controller.list);

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/data_range is requested with method GET.
Returns decimated historic data depending on parameters in query string.
************************************************************************************************/
router.get('/data_range', api_controller.validate('data_range'), api_controller.data_range);

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/get_compressors is requested with method GET.
Returns basic information about all compressors.
************************************************************************************************/
router.get('/get_compressors', api_controller.get_compressors);

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/get_compressors_statuses is requested with method GET.
Returns number of compressors with working, warning and broken status.
************************************************************************************************/
router.get('/get_compressors_statuses', api_controller.get_compressors_statuses)

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/get_compressor is requested with method GET.
Returns decimated historic compressor data for specific compressor ID.
************************************************************************************************/
router.get('/get_compressor', api_controller.validate('get_compressor'), api_controller.get_compressor);

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/compressor_latest_range is requested with method GET.
Returns latest compressor data for given a given ID and interval back in time.
************************************************************************************************/
router.get('/compressor_latest_range', api_controller.compressor_latest_range);

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/get_compressor_limits is requested with method GET.
Returns warning and breaking limits for compressor values.
************************************************************************************************/
router.get('/get_compressor_limits', api_controller.get_compressor_limits)

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/test is requested with method GET.
Displays test page for API.
************************************************************************************************/
router.get('/data_range/test', function(req, res, next) {
	res.render('api-data-range-test');
});

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/data_latest_range is requested with method GET.
Returns latest data for a time interval back in time.
************************************************************************************************/
router.get('/data_latest_range', api_controller.data_latest_range);

/************************************************************************************************
Defines what should happen when http://localhost:3000/api/get_file is requested with method GET.
Returns specified data file depending on parameters in query string.
************************************************************************************************/
router.get('/get_file', api_controller.get_file);

module.exports = router;
