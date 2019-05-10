export class CompressorsTable
{
	constructor(cross_filter, container_id)
	{
		this.container_id = container_id;
		this.table = dc_datatables.datatable(this.container_id);

		this.dimension = cross_filter.dimension( d => {
			return d.id;
		});

		this.table
			.dimension(this.dimension)
			.group( d => {
				return d.id;
			})
			.size(10)
			this.table.options(
				{
					order: [[ 3, "desc" ]],
					createdRow: function(row, data, index) {
						if(data.status == 1)
						{
							$(row).addClass("warning");
						}
						if(data.status == 2)
						{
							$(row).addClass("broken");
						}
					}
				}
			)
			.columns([
				{
					label: 'ID',
					format: d => {
						return d.id;
					}
				},
				{
					label: 'Location',
					format: d => {
						return d.location;
					}
				},
				{
					label: 'Status',
					format: d => {
						var icon_url;
						switch(d.status)
						{
							case 0:
								return 'Working'; break;
							case 1:
								return 'Warning'; break;
							case 2: 
								return 'Broken'; break;
							default:
								return 'Working';
						}
					}
				},
				{
					label: 'Status Time',
					format: d => {
						return d.status_time;
					}
				}
			]);

		this.table.render();

		$('#DataTables_Table_0').width('100%');

		const table = this.table.dt();
		$(this.container_id + " tbody").on("click", "tr", function(d) {
			window.location.href = "dashboard?data=compressor&view=compressor&id=" + table.row(this).data().id;
		});
	}

	redraw()
	{
		this.table.redraw();
	}
}