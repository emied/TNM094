import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class MinuteLineChart{
  constructor(cross_filter, container_id, height, start, end, chart_label, attr, range_chart, dimension){
    this.container_id = container_id;
    this.chart = dc.lineChart(this.container_id);
    this.group = dimension.group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);

    var y_range = [
      Math.min.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum / d.value.count : 0 })) * 0.99,
      Math.max.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum / d.value.count : 0 })) * 1.01
    ];

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
			.valueAccessor(d => {return d.value.count ? d.value.sum / d.value.count : 0 })
      .colors( ['#333333', '#333333', '#2d5986', '#2d5986', '#2d5986'])
      .colorDomain([0,3])
      .colorAccessor( function(d,i){
        if(attr == 'flow'){
          return 0;
        }
        else if(attr == 'oil_pressure'){
          return 0;
        }
        else if(attr == 'humidity'){
          return 0;
        }
        else if(attr == 'bearing_vibration'){
          return 0;
        }
        else if(attr == 'ambient_temp'){
          return 0;
        }
        else if(attr == 'oil_temp'){
          return 0;
        }
      })
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
