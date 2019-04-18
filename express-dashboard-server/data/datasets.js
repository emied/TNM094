/**********************************************************

datasets.js

Module for parsing all external data to javascript objects.
The results is exported as the object 'datasets'.

All data stored in datasets needs to have a value called
'start_time' formatted as "YYYY-MM-DD hh:mm:ss". The
data also needs to be sorted according to this value in
ascending order.

This is preferably done externally on the source data
before it's used here to save processing time each time
the server starts, but some quick data processing stuff
could be done here for flexibility.

No check will be done to make sure that the data follows
these rules (would be too processing intensive). The onus
is on the developers to make sure that the rules are
followed, otherwise crashes or unexpected results might
happen.

**********************************************************/

var d3 = require('d3');
var fs = require('fs');
var debug = require('debug')('dashboard:datasets');

debug('Loading datasets')

var datasets = {};
var compressors = [];
var sweden_geojson;

try {
	datasets['bike'] = d3.csvParse(fs.readFileSync('data/source/fordgobike_complete_all.csv', 'utf8'));
	datasets['compressor'] = d3.csvParse(fs.readFileSync('data/source/compressor.csv', 'utf8'));
	sweden_geojson = JSON.parse(fs.readFileSync('data/source/sweden.json', 'utf8'));
} catch (err) {
	console.log("Error parsing CSV data. This probably means that you haven't downloaded the new data from the README.");
}

var first = new Date(datasets['compressor'][0].start_time);
datasets['compressor'].map( (d, i) => {
	// Scale start_time from 5 sec to 150 sec data frequency.
	require('./utility.js').formatDate(new Date(first.valueOf() + (new Date(d.start_time).valueOf() - first.valueOf())*30));
})

const C = require('./constants.js').COMPRESSORS;
var coordinates = require('random-points-on-polygon')(C.NUM, sweden_geojson.features[0]);

const random_in_range = (min, max) => { return Math.random() * (min - max) + max }
const random_in_deviation = (deviation) => { return random_in_range(-deviation, deviation) }

for(var i = 0; i < C.NUM; i++)
{
	var coord = coordinates[i].geometry.coordinates;
	compressors.push({
		id: i,
		lat: coord[0],
		lon: coord[1],
		start_time_offset: Math.round(random_in_range(0.0, C.START_TIME_DEVIATION)),
		index_offset: Math.round(random_in_range(0.0, C.INDEX_DEVIATION)),
		flow_offset: random_in_deviation(C.FLOW_DEVIATION),
		bearing_vibration_offset: random_in_deviation(C.BEARING_VIBRATION_DEVIATION),
		oil_pressure_offset: random_in_deviation(C.OIL_PRESSURE_DEVIATION),
		oil_temp_offset: random_in_deviation(C.OIL_TEMP_DEVIATION),
		ambient_temp_offset: random_in_deviation(C.AMBIENT_TEMP_DEVIATION),
		humidity_offset: random_in_deviation(C.HUMIDITY_DEVIATION)
	})
}

/*
This could be called here:
require('../data/reduction-code/addStationZipCodes').addStationZipCodes();

But better to only do this once when files change
*/

/*************************************
New datasets will be added like
datasets['solar'] = ...

it can then be accesed like:
datasets.solar or datasets['solar']

Getting the names of all datasets
can be done with:
Object.keys(datasets)

which would return array:
['bike', 'solar']

This along with getting the names
of all values/signals in the datasets
will be needed for API requests.
*************************************/

debug('Loaded datasets: ' + Object.keys(datasets));

exports.datasets = datasets;
exports.compressors = compressors;
