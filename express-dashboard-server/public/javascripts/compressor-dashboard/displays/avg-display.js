import { reduceAddAvg, reduceRemoveAvg, reduceInitAvg } from '../../avg-reduce.js';

export class AvgDisplay {
	constructor(cross_filter, container_id, attr, title, unit, modifier=1) {
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);

		this.group = cross_filter.groupAll().reduce(reduceAddAvg(attr), reduceRemoveAvg(attr), reduceInitAvg);

		this.display
			.formatNumber(d3.format(".2f"))
			.valueAccessor(d => { return d.count ? (d.sum*modifier / ((d.count))) : 0 })
			.html({some: "<h4 class=id-avg-display><br>" + title + "</h4><h5 class=id-avg-display>%number " + unit + "</h5>"})
			.group(this.group);

		this.display.render();

		this.attr = attr;
		this.title = title;
		this.unit = unit;
		this.modifier = modifier;
	}

	redraw(value)
	{
		if(!isNaN(value))
		{
			var v = this.display.formatNumber()(value*this.modifier);
			this.display.valueAccessor(d => { return v; });
		}
		else
		{
			this.display.valueAccessor(d => { return d.count ? (d.sum*this.modifier / ((d.count))) : 0 });
		}
		this.display.redraw();
	}
}