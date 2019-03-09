/*******************

add-station-zip-codes.js

A function that given:

- a geojson file with polygon map regions that corresponds to different zip codes (san-francisco-zip-codes.geojson)
- a file that contains lat/long coordinates of every station (station_id_names.csv)

adds the zip codes to the station file.

*******************/

var d3 = require('d3');
var fs = require('fs');

exports.addStationZipCodes = function() {
	var stations = d3.csvParse(fs.readFileSync('data/source/station_id_names.csv', 'utf8'));
	var map_data = JSON.parse(fs.readFileSync('data/source/san-francisco-zip-codes.geojson', 'utf8'));

	map_data.features.forEach(function(zip_region) {
		stations.forEach(function(station) {
			if(d3.geoContains(zip_region, [+station.lon, +station.lat]))
			{
				station.zip = zip_region.properties.zip_code;
			}
		});
	});
	console.log('done');
	fs.writeFileSync('data/source/bike_stations.csv', d3.csvFormat(stations), 'utf8');
}