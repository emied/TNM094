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

fs.writeFileSync('data/source/sweden_lakes_removed.geojson', JSON.stringify(sweden_geojson), 'utf8');

const C = require('./constants.js').COMPRESSORS;

var coordinates = require('random-points-on-polygon')(C.NUM, sweden_geojson.features[0]);

const random_in_range = (min, max) => { return Math.random() * (min - max) + max }
const random_in_deviation = (deviation) => { return random_in_range(-deviation, deviation) }

const updateCompressor = async c => {
	var start = global.compressor_current_time;
	global.compressor_current_time = new Date(global.compressor_start_time.valueOf() + global.timescale*(new Date() - global.server_start_time));

	if(c.status == 2)
	{
		return;
	}

	var vibration_spike = Math.random() <= C.VIBRATION_SPIKE_PROBABILITY;
	var vibration_rise = Math.random() <= C.VIBRATION_RISE_PROBABILITY;
	var pressure_spike = Math.random() <= C.PRESSURE_SPIKE_PROBABILITY;
	var pressure_rise = Math.random() <= C.PRESSURE_RISE_PROBABILITY;

	if(!(vibration_spike || vibration_rise || pressure_spike || pressure_rise || c.vibration_rise || c.pressure_rise))
	{
		return;
	}

	const formatDate = require('../data/utility.js').formatDate;

	for(var i = 4300 + c.index_offset; i < (datasets['compressor'].length - c.index_offset); i++) {
		
		var start_time = new Date(new Date(datasets['compressor'][i].start_time).valueOf() + c.start_time_offset)

		if(start_time > start)
		{
			var v = datasets['compressor'][i];

			if(vibration_spike)
			{
				c.vibration_add.set(formatDate(start_time), C.VIBRATION_SPIKE_AMP);
			}
			if(pressure_spike)
			{
				c.pressure_add.set(formatDate(start_time), C.PRESSURE_SPIKE_AMP);
			}

			if(vibration_rise || c.vibration_rise)
			{
				c.vibration_rise = true;
				c.prev_vibration_rise += C.VIBRATION_RISE_SPEED;
				c.vibration_add.set(formatDate(start_time), c.prev_vibration_rise);
			}
			if(pressure_rise || c.pressure_rise)
			{
				c.pressure_rise = true;
				c.prev_pressure_rise += C.PRESSURE_RISE_SPEED;
				c.pressure_add.set(formatDate(start_time), c.prev_pressure_rise);
			}

			var vibration = +v.bearing_vibration + c.bearing_vibration_offset;
			var v_add = c.vibration_add.get(formatDate(start_time));
			vibration += v_add ? v_add : 0;

			var pressure = +v.oil_pressure + c.oil_pressure_offset;
			var p_add = c.pressure_add.get(formatDate(start_time));
			pressure += p_add ? p_add : 0;

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

				c.break_time = formatDate(start_time);
				c.status_time = formatDate(start_time);
				c.status = 2;

				break;
			}

			if(vibration >= C.VIBRATION_WARN_LIMIT || pressure >= C.PRESSURE_WARN_LIMIT)
			{
				if(c.status == 0)
				{
					global.statuses.arr = [-1, 1, 0];
					c.status_time = formatDate(start_time);
				}

				c.status = 1;
			}

			break;
		}
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
		break_time: undefined,
		status_time: '-',
		start_time_offset: Math.round(random_in_range(0.0, C.START_TIME_DEVIATION)),
		index_offset: Math.round(random_in_range(0.0, C.INDEX_DEVIATION)),
		flow_offset: random_in_deviation(C.FLOW_DEVIATION),
		bearing_vibration_offset: random_in_deviation(C.BEARING_VIBRATION_DEVIATION),
		oil_pressure_offset: random_in_deviation(C.OIL_PRESSURE_DEVIATION),
		oil_temp_offset: random_in_deviation(C.OIL_TEMP_DEVIATION),
		ambient_temp_offset: random_in_deviation(C.AMBIENT_TEMP_DEVIATION),
		humidity_offset: random_in_deviation(C.HUMIDITY_DEVIATION),

		vibration_rise: false,
		pressure_rise: false,
		prev_vibration_rise: 0,
		prev_pressure_rise: 0,

		vibration_add: new Map(),
		pressure_add: new Map()
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
