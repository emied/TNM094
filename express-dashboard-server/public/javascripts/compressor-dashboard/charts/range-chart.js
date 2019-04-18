import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';
export class RangeChart{
  constructor(cross_filter, container_id, start, end, dimension, attr){
    this.container_id = container_id;
    this.chart = dc.barChart(this.container_id)
    this.group = dimension.group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);

    this.chart
      .width($(this.container_id).width())
      .height(70)
      .dimension(dimension)
      .group(this.group)
      .x(d3.scaleTime().domain([start, end]))
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
      //this.chart.transitionDuration(0);
    }

    redraw(){
      this.chart.redraw();
    }
}
