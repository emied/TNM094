class UniqueBikesDisplay
{
	constructor(cross_filter, container_id)
	{
		this.container_id = '#' + container_id;
		this.display = dc.numberDisplay(this.container_id);

		this.group = cross_filter.groupAll().reduce(
			function(p, v) { 
				const count = p.bikes.get(v.bike_id) ||  0;
				p.bikes.set(v.bike_id, count + 1);
				return p;
			},

			function(p, v) { 
				const count = p.bikes.get(v.bike_id);
				if (count === 1) 
				{
					p.bikes.delete(v.bike_id);
				} 
				else 
				{
					p.bikes.set(v.bike_id, count - 1);
				}
				return p;
			},

			function() { 
				return { bikes: new Map() };
			}
		);

		this.display
			.formatNumber(d3.format(".0f"))
			.html({some: "<h4 class='info-box-text'><br>Unique Bikes Used</h4><h5 class='info-box-text'>%number</h5>"})
			.group(this.group)
			.valueAccessor( d => { return d.bikes.size } );

		this.display.render();
	}
}