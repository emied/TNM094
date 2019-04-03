import { BikeIdChart } from './charts/bike-id-chart.js';
import { GenderChart } from './charts/gender-chart.js';
import { DateChart } from './charts/date-chart.js';
import { MapChart } from './charts/map-chart.js';

import { AvgSpeedDisplay } from './displays/avg-speed-display.js';
import { TotalDistanceDisplay } from './displays/total-distance-display.js';
import { UniqueBikesDisplay } from './displays/unique-bikes-display.js';
import { AvgDurationDisplay } from './displays/avg-duration-display.js';

export class BikeDashboard
{
	constructor(data, map_data, station_data)
	{
		this.data = this.processData(data, station_data);
		this.cross_filter = crossfilter(this.data);

		this.bike_id_chart = new BikeIdChart(this.cross_filter, '#bike-id-chart', 240);
		this.gender_chart = new GenderChart(this.cross_filter, '#pie-chart', 240);
		this.date_chart = new DateChart(this.cross_filter, '#date-bar-chart', 140);
		this.map_chart = new MapChart(this.cross_filter, '#map-chart', 400, map_data, this.bike_stations, this.data, this.bike_id_chart.group.top(1)[0].key);

		this.avg_speed_display = new AvgSpeedDisplay(this.cross_filter, '#info-box-1');
		this.total_distance_display = new TotalDistanceDisplay(this.cross_filter, '#info-box-2');
		this.unique_bikes_display = new UniqueBikesDisplay(this.cross_filter, '#info-box-3');
		this.avg_duration_display = new AvgDurationDisplay(this.cross_filter, '#info-box-4');
	}

	resize()
	{
		this.bike_id_chart.resize();
		this.gender_chart.resize();
		this.date_chart.resize();
		this.map_chart.resize();
	}

	redraw()
	{
		this.bike_id_chart.redraw();
		this.gender_chart.redraw();
		this.date_chart.redraw();
		this.map_chart.redraw();

		this.avg_speed_display.redraw();
		this.total_distance_display.redraw();
		this.unique_bikes_display.redraw(); 
		this.avg_duration_display.redraw(); 
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

		 bike_stations.get(station id).zip (for example) is used 
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

	addDataEntry(data)
	{
		if(this.bike_stations.get(data.start_id))
		{
			this.cross_filter.add([data]);
		}
	}
}