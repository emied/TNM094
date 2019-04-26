import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class TableChart {
	constructor(cross_filter, container_id, attr, dimension, modifier=1){
		this.container_id = container_id;
		this.chart = dc.dataTable(this.container_id);
		this.group = dimension.group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);



		this.chart
      .dimension(dimension)
			.size(Infinity)
			.group(function(d){
      	var date = new Date(d.start_time);
      	date.setHours(date.getHours(), 0, 0, 0);
      	return date;
      })
      .columns(['start_time' , attr])
      //.sortBy('start_time')
      .order(d3.ascending)
			.render();
		}

		resize() {
			this.chart
				.width($(this.container_id).width())
				.transitionDuration(0);

			this.chart.render();
			this.chart.transitionDuration(750);
		}

		redraw(end) {
			this.end = end;

			this.chart.redraw();
		}
}
