class BikeDashboard
{
	constructor(data, map_data, station_data)
	{
		this.cross_filter = crossfilter(this.processData(data, station_data));

		this.bike_id_chart = new BikeIdChart(this.cross_filter, 'bike-id-chart');
		this.gender_chart = new GenderChart(this.cross_filter, 'pie-chart');
		this.date_chart = new DateChart(this.cross_filter, 'date-bar-chart');
		this.map_chart = new MapChart(this.cross_filter, 'map-chart', map_data, this.bike_stations);
	}

	resize()
	{
		this.bike_id_chart.resize();
		this.gender_chart.resize();
		this.date_chart.resize();
		this.map_chart.resize();
	}

	processData(data, station_data)
	{
		// Filter out stations that we haven't assigned ZIP codes to yet
		var bike_stations_zip = station_data.filter(station => { return station.zip != ""; });

		/********************************************************** 
		 For each bike ride, find the ZIP code of its start station
		 and remove data entry if none can be found.
		 Since we only use geo data with ZIP codes from SF currently,
		 every bike ride outside SF will be removed (Bay Area, San Jose)

		 This is pretty processing intensive. It's basically a tradeoff 
		 between bandwidth and processing (less data needs to be sent
		 but more processing needs to be done on that data). There
		 might me a better solution.

		 Update: 
		 This gives a 600% performance improvement compared to
		 the old method (at decimate=8). 

		 Now bike_stations.get(station id).zip (for example) is used 
		 to get specific data of a station.
		**********************************************************/
		this.bike_stations = new Map();
		
		bike_stations_zip.forEach(station => {
			var obj = {lat: station.lat, lon: station.lon, zip: station.zip, name: station.name};
			this.bike_stations.set(station.id, obj);
		})

		// Filter out bike ride entries that starts in a station w/o ZIP code
		return data.filter(d => { return this.bike_stations.get(d.start_id)});
	}
}