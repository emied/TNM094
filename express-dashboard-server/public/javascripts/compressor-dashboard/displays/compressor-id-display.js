export class CompressorIdDisplay {

	constructor(cross_filter, container_id, compressor_id, location) {
		this.container_id = container_id;
		this.display = dc.numberDisplay(this.container_id);
    this.compressor_id = compressor_id;
    this.location = location;

    this.group = cross_filter.group().reduceCount();

    this.display
      .formatNumber(d3.format(".2f"))
      .html({some: "<h4 class='compressor-id'><br>Compressor:"this.compressor_id"</h4>"})
      .group(this.group);

		this.display.render();
	}
}
