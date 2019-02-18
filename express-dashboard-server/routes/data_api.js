var express = require('express');
var router = express.Router();

var d3 = require('d3');
var bike_data = require('../app').bike_data;

/* GET data_api listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/get_range', function(req, res, next) {
	var date_format_parser = d3.timeParse(d3.timeFormat('%Y-%m-%d %H:%M:%S'));

	var start = date_format_parser(req.query.start);
	var end = date_format_parser(req.query.end);
	var decimate = +req.query.decimate;

	var data = [];
	for(var i = 0; i < bike_data.length; i += decimate)
	{
		var date = date_format_parser('2018-' + bike_data[i].start_time);
		if(date >= start)
		{
			if(date >= end)
			{
				break;
			}
			else
			{
				data.push(bike_data[i]);
			}
		}
	}
	res.json(data);
});

module.exports = router;
