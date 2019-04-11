import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../avg-reduce.js';

export class OilPressureChart{
  constructor(cross_filter, container_id, height, start, end){
    this.container_id = container_id;
    this.chart = dc.lineChart(this.container_id);
    this.rangeChart = dc.barChart('#range-chart')


    this.dimension = cross_filter.dimension(function(d) {
      var minute = new Date(d.start_time);
      minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
      return minute;
    });

    this.group = this.dimension.group().reduce(reduceAddAvg("oil_pressure"), reduceRemoveAvg("oil_pressure"), reduceInitAvg);

    this.rangeChart
      .width($(this.container_id).width())
      .height(46)
      .dimension(this.dimension)
      .group(this.group)
      .x(d3.scaleTime().domain([start, end]))
      .centerBar(true)
      .xUnits(d3.timeMonth)
      .margins({left: 50, top: 0, right: 20, bottom: 20})
      .render();

    this.chart
			.width($(this.container_id).width())
			.height(height)
			.group(this.group)
      .rangeChart(this.rangeChart)
			.dimension(this.dimension)
			.margins({left: 50, top: 20, right: 20, bottom: 20}) // hide axes
      .x(d3.scaleTime().domain([start, end]))
			.yAxisLabel("Oil Temp (°C)")
      .xUnits(d3.timeDay)
      .brushOn(false)
      .mouseZoomable(true)
      .zoomScale([1, 100])
      .zoomOutRestrict(true)
      .elasticY(true)
      .renderVerticalGridLines(true)
      .renderHorizontalGridLines(true)
			.valueAccessor(d => { return d.value.avg; })

    this.chart.render();
  	}

    resize(){
      this.rangeChart
        .width($(this.container_id).width())
        .transitionDuration(0);

      this.rangeChart.render();
      this.rangeChart.transitionDuration(750);

      this.chart
        .width($(this.container_id).width())
        .transitionDuration(0);

      this.chart.render();
      this.chart.transitionDuration(750);


    }

    redraw(){
      this.rangeChart.redraw();
      this.chart.redraw();

    }
}
