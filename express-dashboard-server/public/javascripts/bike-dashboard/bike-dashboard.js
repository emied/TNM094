class BikeDashboard
{
	constructor(data, map_data, station_data)
	{
		var bike_stations_zip = station_data.filter(station => { return station.zip != ""; });
		var bike_stations = new Map();
		bike_stations_zip.forEach(station => {
			var obj = {lat: station.lat, lon: station.lon, zip: station.zip, name: station.name};
			bike_stations.set(station.id, obj);
		})
		data = data.filter(d => { return bike_stations.get(d.start_id)});

		this.cross_filter = crossfilter(data);

		this.bike_id_chart = new BikeIdChart(this.cross_filter, 'bike-id-chart');
		this.gender_chart = new GenderChart(this.cross_filter, 'pie-chart');
		this.date_chart = new DateChart(this.cross_filter, 'date-bar-chart');
		this.map_chart = new MapChart(this.cross_filter, 'map-chart', map_data, bike_stations);
	}

	resize()
	{
		this.bike_id_chart.resize();
		this.gender_chart.resize();
		this.date_chart.resize();
		this.map_chart.resize();
	}
}