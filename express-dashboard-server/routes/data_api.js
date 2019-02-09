var express = require('express');
var router = express.Router();

var fs = require('fs');
var d3 = require('d3');
var csv = require('papaparse');

/* GET data_api listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/get_range', function(req, res, next) {

	var date_format_parser = d3.timeParse(d3.timeFormat('%Y-%m-%d %H:%M:%S'));

	var start = date_format_parser(req.query.start);
	var end = date_format_parser(req.query.end);
	var decimate = +req.query.decimate;
	
	var input = fs.createReadStream('data/fordgobike_all.csv');
	
	var data = [];
	var i = 0;
	csv.parse(input, {
		fastMode: true,
		header: true,
		delimiter: ',',
		dynamicTyping: true,
		step: function(row, parser) {
			var date = date_format_parser('2018-' + row.data[0].start_time);

			i++;
			if(!(i % decimate) && date >= start)
			{
				if(date >= end)
				{
					parser.abort();
				}
				else
				{
					data.push(row.data[0]);
				}
			}
		},
		complete: function() {
			res.send(JSON.stringify(data));
		}
	});
});

module.exports = router;
