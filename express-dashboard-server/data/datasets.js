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
var sweden_geojson;

try {
	datasets['bike'] = d3.csvParse(fs.readFileSync('data/source/fordgobike_complete_all.csv', 'utf8'));
	datasets['compressor'] = d3.csvParse(fs.readFileSync('data/source/compressor.csv', 'utf8'));
	sweden_geojson = JSON.parse(fs.readFileSync('data/source/sweden.json', 'utf8'));
} catch (err) {
	console.log("Error parsing CSV data. This probably means that you haven't downloaded the new data from the README.");
}

const NUM_COMPRESSORS = 100;

const START_TIME_DEVIATION = 1000*60*60*24;
const FLOW_DEVIATION = 1000.0;
const BEARING_VIBRATION_DEVIATION = 1.0;
const OIL_PRESSURE_DEVIATION = 0.5;
const OIL_TEMP_DEVIATION = 5;
const AMBIENT_TEMP_DEVIATION = 20;
const HUMIDITY_DEVIATION = 2;

const random_in_range = (min, max) => { return Math.random() * (min - max) + max }
const random_in_deviation = (deviation) => { return random_in_range(-deviation, deviation) }

var coordinates = require('random-points-on-polygon')(NUM_COMPRESSORS, sweden_geojson.features[0]);

datasets['compressors'] = [];
for(var i = 0; i < NUM_COMPRESSORS; i++)
{
	var coord = coordinates[i].geometry.coordinates;
	datasets['compressors'].push({
		id: i,
		lat: coord[0],
		lon: coord[1],
		start_time_offset: Math.round(random_in_range(-START_TIME_DEVIATION, 0.0)),
		flow_offset: random_in_deviation(FLOW_DEVIATION),
		bearing_vibration_offset: random_in_deviation(BEARING_VIBRATION_DEVIATION),
		oil_pressure_offset: random_in_deviation(OIL_PRESSURE_DEVIATION),
		oil_temp_offset: random_in_deviation(OIL_TEMP_DEVIATION),
		ambient_temp_offset: random_in_deviation(AMBIENT_TEMP_DEVIATION),
		humidity_offset: random_in_deviation(HUMIDITY_DEVIATION)
	})
}


const formatDate = (date) => {
	const zeroPad = (n) =>  n > 9 ? n : '0' + n;

	var year = date.getFullYear(),
	month = zeroPad(date.getMonth() + 1),
	day = zeroPad(date.getDate()),
	hour = zeroPad(date.getHours()),
	minute = zeroPad(date.getMinutes()),
	second = zeroPad(date.getSeconds());

  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

var ret_comp = [];
datasets['compressors'].forEach( (c) => {
	var obj = {
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
	};

	for(var i = 4300; i < 4300 + ((60*12)/2.5); i++) {
		var v = datasets['compressor'][i];

		obj.start_time.push(formatDate(new Date((new Date(v.start_time).valueOf() + c.start_time_offset))));
		obj.flow.push(+v.flow + c.flow_offset);
		obj.bearing_vibration.push(+v.bearing_vibration + c.bearing_vibration_offset);
		obj.oil_pressure.push(+v.oil_pressure + c.oil_pressure_offset);
		obj.oil_temp.push(+v.oil_temp + c.oil_temp_offset);
		obj.ambient_temp.push(+v.ambient_temp + c.ambient_temp_offset);
		obj.humidity.push(+v.humidity + c.humidity_offset);
	}
	ret_comp.push(obj);
});

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

module.exports = datasets;