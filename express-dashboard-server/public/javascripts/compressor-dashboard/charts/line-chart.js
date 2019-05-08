import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class LineChart {
	constructor(cross_filter, container_id, height, start, end, attr, range_chart, dimension, modifier=1, limit=undefined) {
		this.container_id = container_id;
		this.chart = dc.lineChart(this.container_id);
		this.group = dimension.group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);

		this.start = start;
		this.end = end;
		this.range_chart = range_chart;
		this.allow_redraw = performance.now();

		this.limit = limit;

		var y_range = [
			Math.min.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum*modifier / d.value.count : 0 })),
			Math.max.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum*modifier / d.value.count : 0 }))
		];

		this.modifier = modifier;

		var dist = Math.abs(y_range[1] - y_range[0]);
		y_range[0] -= dist*0.1;
		y_range[1] += dist*0.1;

		this.chart
			.width($(this.container_id).width())
			.height(height)
			.group(this.group)
			.rangeChart(range_chart)
			.dimension(dimension)
			.x(d3.scaleTime().domain([start, end]))
			.y(d3.scaleLinear().domain(y_range))
			.xUnits(d3.timeDay)
			.yAxisLabel(" ", 18)
			.brushOn(false)
			.mouseZoomable(true)
			.zoomScale([1, 100])
			.zoomOutRestrict(true)
			.renderVerticalGridLines(true)
			.renderHorizontalGridLines(true)
			.valueAccessor(d => {return d.value.count ? d.value.sum*modifier / d.value.count : 0 })
			.colors( ['#333333', 'yellow', 'red'])
			.colorDomain([0,2])
			.colorAccessor( (d,i) => {
				var v = d[i] ? d[i].data.value : d.data.value;
				v = v.count ? v.sum / v.count : 0;

				if(this.limit)
				{
					if(v >= this.limit[1])
					{
						return 2;
					}
					if(v >= this.limit[0])
					{
						return 1;
					}
				}
				return 0;
			})
			.renderDataPoints({radius: 4, fillOpacity: 1, strokeOpacity: 1})
			.render();

			this.drawLimitDots();
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

			// Makes zooming a little wonky for some reason but doesn't reset the range at each redraw now at least.
			var range = this.range_chart.filters();
			if(range.length)
			{
				this.chart.x(d3.scaleTime().domain([range[0][0], range[0][1]]));
			}
			else
			{
				this.chart.x(d3.scaleTime().domain([this.start, this.end]));
			}

			var modifier = this.modifier;

			var y_range = [
				Math.min.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum*modifier / d.value.count : 0 })),
				Math.max.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum*modifier / d.value.count : 0 }))
			];

			var dist = Math.abs(y_range[1] - y_range[0]);
			y_range[0] -= dist*0.1;
			y_range[1] += dist*0.1;

			this.chart.y(d3.scaleLinear().domain(y_range));

			this.chart.redraw();
		}

		setAttribute(attr, modifier, limit=undefined)
		{
			this.group = this.chart.dimension().group().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);

			this.limit = limit;

			var y_range = [
				Math.min.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum*modifier / d.value.count : 0 })),
				Math.max.apply(Math, this.group.all().map(function(d) { return d.value.count ? d.value.sum*modifier / d.value.count : 0 }))
			];

			this.modifier = modifier;

			var dist = Math.abs(y_range[1] - y_range[0]);
			y_range[0] -= dist*0.1;
			y_range[1] += dist*0.1;

			this.chart
				.group(this.group)
				.y(d3.scaleLinear().domain(y_range))
				.valueAccessor(d => {return d.value.count ? d.value.sum*modifier / d.value.count : 0 })
				.redraw();
		}

		drawLimitDots()
		{
			this.chart.on("pretransition", _chart => {
				_chart.svg().selectAll("circle.dot").each(function(d,i) {
					d3.select(this)
						.attr("stroke", "black")
						.style("stroke-width", "0.1%")
						.style("stroke", "black")
				})

				// if(this.limit)
				// {
				// 	var limit = this.limit;
				// 	var svg = _chart.svg();
				// 	svg.selectAll("circle.dot").each(function(d,i) {
				// 		var v = d.data.value.count ? d.data.value.sum / d.data.value.count : 0;
				// 		if(v < limit[0])
				// 		{
				// 			d3.select(this).attr("r", 0);
				// 		}
				// 		else
				// 		{
				// 			d3.select(this)
				// 				.attr("r", 4)
				// 				.attr("stroke", "black")
				// 				.style("stroke-width", "0.1%")
				// 				.style("fill-opacity", 1.0);
				// 		}
				// 	})
				// }
			});
		}
}
