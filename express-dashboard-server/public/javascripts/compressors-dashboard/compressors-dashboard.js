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

		this.data = JSON.parse(JSON.stringify(data));
		this.cross_filter = crossfilter(data);

		this.status_dimension = this.cross_filter.dimension( d => {
			return +d.status;
		})

		this.map_chart_cluster = new MapChartCluster(this.cross_filter, '#map-chart-cluster', 600);
		this.working_display = new StatusDisplay(this.cross_filter, '#working-display', 0, "Working");
		this.warning_display = new StatusDisplay(this.cross_filter, '#warning-display', 1, "Warning");
		this.broken_display = new StatusDisplay(this.cross_filter, '#broken-display', 2, "Broken");
		this.search_table = new SearchTable(data);
		
		this.setClickListeners()
	}

	resize()
	{
		this.map_chart_cluster.resize();
	}

	redraw()
	{
		this.broken_display.redraw();
		this.working_display.redraw();
		this.warning_display.redraw();
		this.map_chart_cluster.redraw();
	}

	addData(data)
	{
		var update = false;
		var new_data = JSON.parse(JSON.stringify(this.data));
		for(var i = 0; i < data.length; i++)
		{
			if(new_data[i].status != data[i].status)
			{
				new_data[i].status = data[i].status;
				update = true;
			}
		}

		if(update)
		{
			this.data = JSON.parse(JSON.stringify(new_data));
			this.cross_filter.remove();
			this.cross_filter.add(new_data);
			this.redraw();
		}
	}

	setClickListeners()
	{
		var names = ['working', 'warning', 'broken'];

		for(var i = 0; i < names.length; i++)
		{
			$('#click-' + names[i]).click({ name: names[i], status: i }, (event) => {
				if($('#click-' + event.data.name).hasClass('active'))
				{
					this.status_dimension.filter(null);
					d3.selectAll('.status-box').classed('active', false);
				}
				else
				{
					this.status_dimension.filter(event.data.status);
					d3.selectAll('.status-box').classed('active', false);
					$('#click-' + event.data.name).toggleClass('active');
				}
				this.redraw();
			});
		}
	}
}
