export class SearchTable
{
	constructor(data)
	{
    const dataTable = $('#search-table').DataTable({
      data: data,
      aoColumns: [
        { title: 'Compressor ID', mData: 'id' },
        { title: 'Location', mData: 'location' },
      ]
    });

    $("#search-table tbody").on("click", "tr", function(d) {
      //console.log(dataTable.row(this).data().id);
      window.location.href = "dashboard?data=compressor&view=compressor&id=" + dataTable.row(this).data().id;

    });
	}
}
