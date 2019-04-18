import { MapChart } from './charts/map-chart.js';

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

		this.map_chart = new MapChart(this.cross_filter, '#map-chart', 415, map_data);
	}

	resize()
	{
		this.map_chart.resize();
	}
}