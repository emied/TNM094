import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class RangeChart{
  constructor(cross_filter, container_id, start, end, dimension, attr){
    this.container_id = container_id;
    this.chart = dc.barChart(this.container_id)
    this.group = dimension.group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);

    var y_range = [
      Math.min.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum / d.value.count : 0 })) * 0.90,
      Math.max.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum / d.value.count : 0 })) * 1.10
    ];
    
    this.chart
      .width($(this.container_id).width())
      .height(70)
      .dimension(dimension)
      .group(this.group)
      .x(d3.scaleTime().domain([start, end]))
      .y(d3.scaleLinear().domain(y_range))
      .centerBar(true)
      .valueAccessor(d => {return d.value.count ? d.value.sum / d.value.count : 0 })
      .renderVerticalGridLines(true)
      .xUnits(d3.timeMonth)
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
