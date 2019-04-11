import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../avg-reduce.js';

export class OilPressureChart
{
  constructor(cross_filter, container_id, height)
  {
    this.container_id = container_id;
    this.chart = dc.lineChart(this.container_id);

    this.dimension = cross_filter.dimension(function(d) {
      var minute = new Date(d.start_time);
      minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
      return minute;
    });
    this.group = this.dimension.group().reduce(reduceAddAvg("oil_pressure"), reduceRemoveAvg("oil_pressure"), reduceInitAvg);



    this.chart
			.width($(this.container_id).width())
			.height(height)
			.group(this.group)
			.dimension(this.dimension)
			.margins({left: 50, top: 20, right: 20, bottom: 0}) // hide axes
      .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
			.yAxisLabel("Oil Temp (°C)")
			.elasticX(true)
      .elasticY(true)
			.valueAccessor(d => { return d.value.avg; })


    this.chart.render();
  	}

    

    redraw()
    {
      this.chart.redraw();
    }

}
