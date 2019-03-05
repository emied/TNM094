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

module.exports = router;
