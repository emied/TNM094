export class StatusDisplay 
{
	constructor(cross_filter, container_id, status, title) 
	{
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);
		this.cross_filter = cross_filter;
		this.group = this.cross_filter.groupAll().reduceSum(d => { return d.status == status });

		this.display
			.formatNumber(d3.format("d"))
			.valueAccessor(d=>{ return d })
			.html({some: "<h4 class=status-display><br>" + title + "</h4><h5 class=status-display>%number</h5>"})
			.group(this.group);

		this.display.render();
	}

	redraw()
	{
		this.display.redraw();
	}
}