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
var sweden_towns;
var sweden_lakes_geojson;

try {
	datasets['bike'] = d3.csvParse(fs.readFileSync('data/source/fordgobike_complete_all.csv', 'utf8'));
	datasets['compressor'] = d3.csvParse(fs.readFileSync('data/source/compressor.csv', 'utf8'));
	sweden_geojson = JSON.parse(fs.readFileSync('data/source/sweden.json', 'utf8'));
	sweden_towns = JSON.parse(fs.readFileSync('data/source/kommuner-kustlinjer.geo.json', 'utf8'));
	sweden_lakes_geojson = JSON.parse(fs.readFileSync('data/source/sweden_lakes.geojson', 'utf8'));
} catch (err) {
	console.log("Error parsing CSV data. This probably means that you haven't downloaded the new data from the README.");
}

var first = new Date(datasets['compressor'][0].start_time);
datasets['compressor'].map( (d, i) => {
	// Scale start_time from 5 sec to 150 sec data frequency.
	d.start_time = require('./utility.js').formatDate(new Date(first.valueOf() + (new Date(d.start_time).valueOf() - first.valueOf())*30));
})

// Subtract lakes
var s_coord = sweden_geojson.features[0].geometry.coordinates;
sweden_lakes_geojson.features.forEach( lake => {
	s_coord[s_coord.length-1].push(lake.geometry.coordinates[0])
})

const C = require('./constants.js').COMPRESSORS;

var coordinates = require('random-points-on-polygon')(C.NUM, sweden_geojson.features[0]);

const random_in_range = (min, max) => { return Math.random() * (min - max) + max }
const random_in_deviation = (deviation) => { return random_in_range(-deviation, deviation) }

const updateCompressor = async c => {

	c.current_index++;

	if(c.status == 2)
	{
		return;
	}

	var vibration_spike = Math.random() <= C.VIBRATION_SPIKE_PROBABILITY;
	var vibration_rise = Math.random() <= C.VIBRATION_RISE_PROBABILITY;
	var pressure_spike = Math.random() <= C.PRESSURE_SPIKE_PROBABILITY;
	var pressure_rise = Math.random() <= C.PRESSURE_RISE_PROBABILITY;

	if(!(vibration_spike || vibration_rise || pressure_spike || pressure_rise || c.vibration_rise_index || c.pressure_rise_index))
	{
		return;
	}

	const formatDate = require('../data/utility.js').formatDate;

	var v = datasets['compressor'][global.compressor_start_index + c.index_offset + c.current_index];

	if(vibration_spike && !c.vibration_spike_index)
	{
		c.vibration_spike_index = c.current_index;
	}
	if(pressure_spike && !c.pressure_spike_index)
	{
		c.pressure_spike_index = c.current_index;
	}
	if(vibration_rise && !c.vibration_rise_index)
	{
		c.vibration_rise_index = c.current_index;
	}
	if(pressure_rise && !c.pressure_rise_index)
	{
		c.pressure_rise_index = c.current_index;
	}

	var vibration = +v.bearing_vibration + c.bearing_vibration_offset;
	vibration += c.vibration_rise_index ? (c.current_index-c.vibration_rise_index)*C.VIBRATION_RISE_SPEED : 0;
	vibration += vibration_spike*C.VIBRATION_SPIKE_AMP;

	var pressure = +v.oil_pressure + c.oil_pressure_offset;
	pressure += c.pressure_rise_index ? (c.current_index-c.pressure_rise_index)*C.PRESSURE_RISE_SPEED : 0;
	pressure += pressure_spike*C.PRESSURE_SPIKE_AMP;

	if(vibration >= C.VIBRATION_BREAK_LIMIT || pressure >= C.PRESSURE_BREAK_LIMIT)
	{
		if(c.status == 0)
		{
			global.statuses.arr = [-1, 0, 1];
		}
		if(c.status == 1)
		{
			global.statuses.arr = [0, -1, 1];
		}

		c.break_index = c.current_index;
		c.status_time = formatDate(new Date());
		c.status = 2;

		c.attr = vibration >= C.VIBRATION_BREAK_LIMIT ? 'bearing_vibration' : 'oil_pressure';

		return;
	}

	if(vibration >= C.VIBRATION_WARN_LIMIT || pressure >= C.PRESSURE_WARN_LIMIT)
	{
		if(c.status == 0)
		{
			global.statuses.arr = [-1, 1, 0];
			c.status_time = formatDate(new Date());
			c.attr = vibration >= C.VIBRATION_WARN_LIMIT ? 'bearing_vibration' : 'oil_pressure';
		}

		c.status = 1;
	}
}

for(var i = 0; i < C.NUM; i++)
{
	var coord = coordinates[i].geometry.coordinates;
	compressors.push({
		id: i,
		lat: coord[0],
		lon: coord[1],
		status: 0,
		break_index: undefined,
		status_time: '-',
		attr: 'flow', // Attribute to display by default
		index_offset: Math.round(random_in_range(0.0, C.INDEX_DEVIATION)),
		flow_offset: random_in_deviation(C.FLOW_DEVIATION),
		bearing_vibration_offset: random_in_deviation(C.BEARING_VIBRATION_DEVIATION),
		oil_pressure_offset: random_in_deviation(C.OIL_PRESSURE_DEVIATION),
		oil_temp_offset: random_in_deviation(C.OIL_TEMP_DEVIATION),
		ambient_temp_offset: random_in_deviation(C.AMBIENT_TEMP_DEVIATION),
		humidity_offset: random_in_deviation(C.HUMIDITY_DEVIATION),

		current_index: 0,

		vibration_rise_index: undefined,
		pressure_rise_index: undefined,
		vibration_spike_index: undefined,
		pressure_spike_index: undefined
	})
}

global.statuses.arr = [C.NUM, 0, 0];

// Find location of compressors
compressors.map(compressor => {
	compressor.location = 'Unknown';
	var coord = [compressor.lat, compressor.lon];
	for(let town of sweden_towns.features) {
		if(d3.geoContains(town, coord))
		{
			// Possible to add other stuff like population if interesting.
			compressor.location = town.properties.name;
			break;
		}
	}
})

compressors.forEach((compressor,i) => {
	setTimeout(() => {
		updateCompressor(compressor); 
		setInterval(() => {
			updateCompressor(compressor); 
		}, 150000/global.timescale) 
	}, (150000/global.timescale)*(i/C.NUM));
})

debug('Loaded datasets: ' + Object.keys(datasets));

exports.datasets = datasets;
exports.compressors = compressors;
