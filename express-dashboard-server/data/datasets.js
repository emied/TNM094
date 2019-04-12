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

try {
	datasets['bike'] = d3.csvParse(fs.readFileSync('data/source/fordgobike_complete_all.csv', 'utf8'));
	datasets['compressor'] = d3.csvParse(fs.readFileSync('data/source/compressor.csv', 'utf8'));
} catch (err) {
	console.log("Error parsing CSV data. This probably means that you haven't downloaded the new data from the README.");
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

module.exports = datasets;
