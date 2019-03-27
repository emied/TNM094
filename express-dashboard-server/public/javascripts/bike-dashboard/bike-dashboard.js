class BikeDashboard
{
	constructor(data)
	{
		this.cross_filter = crossfilter(data);
		
		this.bike_id_chart = new BikeIdChart(this.cross_filter, 'bike-id-chart');
		this.gender_chart = new GenderChart(this.cross_filter, 'pie-chart');
		this.date_chart = new DateChart(this.cross_filter, 'date-bar-chart');
	}

	resize()
	{
		this.bike_id_chart.resize();
		this.gender_chart.resize();
		this.date_chart.resize();
	}
}