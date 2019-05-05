import { MapChartCluster } from './charts/map-chart-cluster.js';
import { StatusChart } from './charts/status-chart.js';
import { StatusDisplay } from './displays/status-display.js';
import { SearchTable } from './charts/search-table.js';
//import { MapChartChoropleth } from './charts/map-chart-choropleth.js';

export class CompressorsDashboard
{
	constructor(data, map_data)
	{
		dc.config.defaultColors([
			"#008c82","#4dd6cb","#52afa0","#71edd9","#21ffdb",
			"#2ac8bc","#2ee8d8","#90f4ec","#4dd6cb","#73c6c0",
			"#74bc6e","#74dd6a","#57d64a","#82e079","#39a361",
			"#2cb1dd","#4bb9dd","#47d1ff","#319bbf","#60bfe0"
		]);

		this.data = data;
		this.cross_filter = crossfilter(this.data);

		this.map_chart_cluster = new MapChartCluster(this.cross_filter, '#map-chart-cluster', 600);
		this.working_display = new StatusDisplay(this.cross_filter, '#working-display', 0, "Working");
		this.broken_display = new StatusDisplay(this.cross_filter, '#broken-display', 2, "Broken");
		//this.status_chart = new StatusChart(this.cross_filter, '#status-chart', 75);
		this.search_table = new SearchTable(this.data);

		//this.map_chart_choropleth = new MapChartChoropleth(this.cross_filter, '#map-chart-choropleth', 600, map_data);
	}

	resize()
	{
		this.map_chart_cluster.resize();
	}

	redraw()
	{
		this.broken_display.redraw();
		this.working_display.redraw();
		this.map_chart_cluster.redraw();
	}

	addData(data)
	{
		var new_data = JSON.parse(JSON.stringify(this.data));
		for(var i = 0; i < data.length; i++)
		{
			new_data[i].status = data[i].status;
		}

		this.cross_filter.remove();
		this.cross_filter.add(new_data);

		this.redraw();
	}
}
