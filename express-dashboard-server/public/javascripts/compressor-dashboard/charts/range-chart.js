
export class RangeChart{
  constructor(cross_filter, container_id, start, end, dimension){
    this.container_id = container_id;
    this.chart = dc.barChart(this.container_id)

    this.group = dimension.group().reduceCount();

    this.chart
      .width($(this.container_id).width())
      .height(90)
      .dimension(dimension)
      .group(this.group)
      .x(d3.scaleTime().domain([start, end]))
      .centerBar(true)
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
