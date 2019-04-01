//var bike_id_table = dc.dataTable("#bike-id-table");



function drawList(data) {

  console.log(data.length);

  for(i = 0; i < data.length; i++) {

    if (data[i].gender == 1) {
      data[i].gender = "Male";
    }
    else if (data[i].gender == 2) {
      data[i].gender = "Female";
    }
    else {
      data[i].gender = "Not available";
    }

  }

  const dataTable = $('#example').DataTable({
    data: data,
    aoColumns: [
      { title: 'Start Time', mData: 'start_time' },
      { title: 'Speed (km/h)', mData: 'speed' },
      { title: 'Age', mData: 'age' },
      { title: 'Gender', mData: 'gender' },
      { title: 'Duration (sec)', mData: 'duration' },
      { title: 'Bike Id', mData: 'bike_id' },
      { title: 'Distance (m)', mData: 'distance' }
    ]

  });


}
/* function drawList(data) {

  var cross_filter = crossfilter(data);

  var bike_id_dimension = cross_filter.dimension(function(d) {
    if (d.bike_id)

    return d.bike_id;
  });



  bike_id_table
    .dimension(bike_id_dimension)
    .group(function(d) {
      return d.bike_id;
    })
    .columns(['bike_id', 'distance'])
    .order(d3.descending);



  dc.renderAll();

}

*/