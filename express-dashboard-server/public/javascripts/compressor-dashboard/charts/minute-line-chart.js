import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../avg-reduce.js';

export class MinuteLineChart{
  constructor(cross_filter, container_id, height, start, end, chart_label, attr, y_range, range_chart, dimension){
    this.container_id = container_id;
    this.chart = dc.lineChart(this.container_id);
    this.group = dimension.group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);


    this.chart
			.width($(this.container_id).width())
			.height(height)
			.group(this.group)
      .rangeChart(range_chart)
			.dimension(dimension)
      .x(d3.scaleTime().domain([start, end]))
      .y(d3.scaleLinear().domain(y_range))
			.yAxisLabel(chart_label)
      .xUnits(d3.timeDay)
      .brushOn(false)
      .mouseZoomable(true)
      .zoomScale([1, 100])
      .zoomOutRestrict(true)
      .renderVerticalGridLines(true)
      .renderHorizontalGridLines(true)
			.valueAccessor(d => {return d.value.avg; })
      .render();
  	}

    resize(){
      this.chart
        .width($(this.container_id).width())
        .transitionDuration(0);

      this.chart.render();
      this.chart.transitionDuration(750);


    }

    redraw(){
      this.chart.redraw();

    }
}
