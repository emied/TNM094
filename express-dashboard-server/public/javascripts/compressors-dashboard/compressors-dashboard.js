import { MapChartCluster } from './charts/map-chart-cluster.js';
import { StatusDisplay } from './displays/status-display.js';
import { CompressorsTable } from './charts/compressors-table.js';

export class CompressorsDashboard
{
	constructor(data, map_data, mode)
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

		this.map_chart_cluster = new MapChartCluster(this.cross_filter, '#map-chart-cluster', 658);
		this.compressors_table = new CompressorsTable(this.cross_filter, '#compressors-table', mode);

		this.setupDisplays();

		this.status_filter = [];

		if(mode == 'troubleshoot')
		{
			this.status_filter = [1, 2];
			this.applyStatusFilter();
		}

		this.setClickListeners()
	}

	resize()
	{
		this.map_chart_cluster.resize();
	}

	redraw()
	{
		this.map_chart_cluster.redraw();
		this.compressors_table.redraw();
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
				new_data[i].status_time = data[i].status_time;
				update = true;
			}
		}

		if(update)
		{
			this.status_dimension.filter(null);
			this.data = JSON.parse(JSON.stringify(new_data));
			this.cross_filter.remove();
			this.cross_filter.add(new_data);
			this.applyStatusFilter();
			this.redraw();
		}
	}

	applyStatusFilter()
	{
		var filter = this.status_filter.length ? d => this.status_filter.includes(d) : null;
		this.status_dimension.filter(filter);
		this.redraw();
	}

	setupDisplays()
	{
		d3.json('./api/get_compressors_statuses').then( statuses => {
			this.working_display = new StatusDisplay('#working-display', 0, "Working", statuses);
			this.warning_display = new StatusDisplay('#warning-display', 1, "Warning", statuses);
			this.broken_display = new StatusDisplay('#broken-display', 2, "Broken", statuses);

			socket.on("statuses", statuses => {
				this.working_display.redraw(statuses);
				this.warning_display.redraw(statuses);
				this.broken_display.redraw(statuses);
			});
		});
	}

	setClickListeners()
	{
		var names = ['working', 'warning', 'broken'];

		for(var i = 0; i < names.length; i++)
		{
			$('#click-' + names[i]).click({ name: names[i], status: i }, (event) => {

				$('#click-' + event.data.name).toggleClass('active');

				if(this.status_filter.includes(event.data.status))
				{
					this.status_filter = this.status_filter.filter( d => { return d != event.data.status });
				}
				else
				{
					this.status_filter.push(event.data.status);
				}

				var reset = true;
				d3.selectAll(".status-box").select( function() { reset &= d3.select(this).classed('active'); });

				if(reset)
				{
					d3.selectAll(".status-box").classed('active', false);
					this.status_filter = [];
				}

				this.applyStatusFilter();
			});

			// Activate boxes on setup if filter is defined (i.e. in troubleshoot mode)
			if(this.status_filter.includes(i))
			{
				d3.select('#click-' + names[i]).classed('active', true);
			}
		}
	}
}
