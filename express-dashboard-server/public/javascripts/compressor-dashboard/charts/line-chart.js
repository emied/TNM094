import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class LineChart {
	constructor(cross_filter, container_id, height, start, end, attr, range_chart, dimension, modifier=1, limit=undefined, status) {
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
			.x(d3.scaleTime().domain([start, new Date(end.valueOf() + (end-start)*0.01)]))
			.y(d3.scaleLinear().domain(y_range))
			.xUnits(d3.timeDay)
			.yAxisLabel(" ", 18)
			.brushOn(false)
			.mouseZoomable(true)
			.title( d => { return 'Time: ' + d3.timeFormat("%Y-%m-%d %H:%M:%S")(d.key) + ', Value: ' + d3.format(".3f")(d.value.count ? d.value.sum*modifier / d.value.count : 0); })
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
			});
		
		if(status != 0)
		{
			this.chart.renderDataPoints({radius: 4, fillOpacity: 1, strokeOpacity: 1})
			//this.drawLimitLines();
		}

		//this.drawLimitDots();
		this.chart.render();
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
				this.chart.x(d3.scaleTime().domain([this.start, new Date(this.end.valueOf() + (this.end-this.start)*0.01)]))
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
				.title( d => { return 'Time: ' + d3.timeFormat("%Y-%m-%d %H:%M:%S")(d.key) + ', Value: ' + d3.format(".3f")(d.value.count ? d.value.sum*modifier / d.value.count : 0); })
				.redraw();
		}

		drawLimitLines()
		{
			var line_chart = this;

			this.chart.on('pretransition', function(chart) {
				var chart_body = chart.select('g.chart-body');
				chart_body.selectAll('path.warn').remove();
				chart_body.selectAll('path.warn-outline').remove();
				chart_body.selectAll('path.break').remove();
				chart_body.selectAll('path.break-outline').remove();

				if(line_chart.limit)
				{
					var warn_data = [
						{x: chart.x().range()[0], y: chart.y()(line_chart.limit[0])}, 
						{x: chart.x().range()[1], y: chart.y()(line_chart.limit[0])}
					];

					var break_data = [
						{x: chart.x().range()[0], y: chart.y()(line_chart.limit[1])}, 
						{x: chart.x().range()[1], y: chart.y()(line_chart.limit[1])}
					];

					var warn_line = d3.line()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
						.curve(d3.curveLinear);

					var warn_outline_path = chart_body.selectAll('path.warn-outline').data([warn_data]);
					warn_outline_path = warn_outline_path
						.enter()
							.append('path')
							.attr('class', 'warn-outline')
							.attr('stroke-width', '0.2%')
							.attr('stroke', 'black')
						.merge(warn_outline_path);
					warn_outline_path.attr('d', warn_line);

					var warn_path = chart_body.selectAll('path.warn').data([warn_data]);
					warn_path = warn_path
						.enter()
							.append('path')
							.attr('class', 'warn')
							.attr('stroke-width', '0.1%')
							//.attr('stroke', 'rgb(191.25, 191.25, 75)')
							.attr('stroke', 'yellow')
						.merge(warn_path);
					warn_path.attr('d', warn_line);

					var break_line = d3.line()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
						.curve(d3.curveLinear);

					var break_outline_path = chart_body.selectAll('path.break-outline').data([break_data]);
					break_outline_path = break_outline_path
						.enter()
							.append('path')
							.attr('class', 'break-outline')
							.attr('stroke-width', '0.2%')
							.attr('stroke', 'black')
						.merge(break_outline_path);
					break_outline_path.attr('d', break_line);

					var break_path = chart_body.selectAll('path.break').data([break_data]);
					break_path = break_path
						.enter()
							.append('path')
							.attr('class', 'break')
							.attr('stroke-width', '0.1%')
							//.attr('stroke', 'rgb(191.25, 75, 75)')
							.attr('stroke', 'red')
						.merge(break_path);
					break_path.attr('d', break_line);
				}
			});
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
