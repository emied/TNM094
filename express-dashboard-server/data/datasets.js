/**********************************************************

datasets.js

Module for parsing all external data to javascript objects.
The results is exported as the object 'datasets'

**********************************************************/

var d3 = require('d3');
var fs = require('fs');

var datasets = {};

datasets['bike'] = d3.csvParse(fs.readFileSync('data/source/fordgobike_all.csv', 'utf8'));

module.exports = datasets;