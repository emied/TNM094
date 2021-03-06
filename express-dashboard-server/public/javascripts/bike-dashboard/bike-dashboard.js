import { BikeIdChart } from './charts/bike-id-chart.js';
import { GenderChart } from './charts/gender-chart.js';
import { MinutesChart } from './charts/minutes-chart.js';
import { MapChart } from './charts/map-chart.js';

import { AvgSpeedDisplay } from './displays/avg-speed-display.js';
import { TotalDistanceDisplay } from './displays/total-distance-display.js';
import { UniqueBikesDisplay } from './displays/unique-bikes-display.js';
import { AvgDurationDisplay } from './displays/avg-duration-display.js';

export class BikeDashboard
{
	constructor(data, map_data, station_data)
	{
		dc.config.defaultColors([
			"#008c82","#4dd6cb","#52afa0","#71edd9","#21ffdb",
			"#2ac8bc","#2ee8d8","#90f4ec","#4dd6cb","#73c6c0",
			"#74bc6e","#74dd6a","#57d64a","#82e079","#39a361",
			"#2cb1dd","#4bb9dd","#47d1ff","#319bbf","#60bfe0"
		]);

		this.data = this.processData(data, station_data);
		this.cross_filter = crossfilter(this.data);

		this.date_range = { start: new Date(this.data[this.data.length - 1].start_time), end: new Date(this.data[0].start_time) };

		this.removeOldData();

		this.bike_id_chart = new BikeIdChart(this.cross_filter, '#bike-id-chart', 240);
		this.gender_chart = new GenderChart(this.cross_filter, '#pie-chart', 240);
		this.date_chart = new MinutesChart(this.cross_filter, '#date-bar-chart', 140, this.date_range);
		this.map_chart = new MapChart(this.cross_filter, '#map-chart', 415, map_data, this.bike_stations, this.data, this.bike_id_chart.group.top(1)[0].key, this.new_data);

		this.avg_speed_display = new AvgSpeedDisplay(this.cross_filter, '#info-box-1');
		this.total_distance_display = new TotalDistanceDisplay(this.cross_filter, '#info-box-2');
		this.unique_bikes_display = new UniqueBikesDisplay(this.cross_filter, '#info-box-3');
		this.avg_duration_display = new AvgDurationDisplay(this.cross_filter, '#info-box-4');

		this.last_draw = performance.now();
	}

	resize()
	{
		this.bike_id_chart.resize();
		this.gender_chart.resize();
		this.date_chart.resize();
		this.map_chart.resize();
	}

	redraw(new_data)
	{
		if(performance.now() - this.last_draw < 500) { return; }

		this.last_draw = performance.now();

		this.bike_id_chart.redraw();
		this.gender_chart.redraw();
		this.date_chart.redraw();
		this.map_chart.redraw(new_data);

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

	addData(data)
	{
		var new_data = data.filter(d => {return this.bike_stations.get(d.start_id)});

		if(new_data.length)
		{
			this.cross_filter.add(new_data);
			
			var bike_chart_filters = this.bike_id_chart.chart.filters();
			var gender_chart_filters = this.gender_chart.chart.filters();
			var date_chart_filters = this.date_chart.chart.filters();
			var map_chart_filters = this.map_chart.chart.filters();

			this.bike_id_chart.chart.filters(null);
			this.gender_chart.chart.filters(null);
			this.date_chart.chart.filters(null);
			this.map_chart.chart.filters(null);

			this.date_range.end = new Date(new_data[new_data.length - 1].start_time);
			var date_cutoff = new Date(this.date_range.end.valueOf() - 30*60*1000);

			var new_start_date = new Date(this.date_range.end);

			this.cross_filter.remove(d => {
				var date = new Date(d.start_time);
				if(date < date_cutoff){
					return true;
				}
				else if(date < new_start_date){
					new_start_date = date;
				}
				return false;
			});
			this.date_range.start = new_start_date;

			this.bike_id_chart.chart.filters([bike_chart_filters]);
			this.gender_chart.chart.filters([gender_chart_filters]);
			this.date_chart.chart.filters([date_chart_filters]);
			this.map_chart.chart.filters([map_chart_filters]);

			if(date_chart_filters.length && date_chart_filters[0][0] < this.date_range.start) {
				this.date_chart.chart.filterAll();
			}

			this.redraw(new_data);
		}
	}

	removeOldData()
	{
		var date_cutoff = new Date(this.date_range.end.valueOf() - 30*60*1000);

		var new_start_date = new Date(this.date_range.end);

		this.cross_filter.remove(d => {
			var date = new Date(d.start_time);
			if(date < date_cutoff){
				return true;
			}
			else if(date < new_start_date){
				new_start_date = date;
			}
			return false;
		});
		this.date_range.start = new_start_date;
	}
}
