function warnings(data) {

  console.log(data.length);

  var sum_humidity = 0;

  for(i = 0; i < data.length; i++) {
    data[i].humidity = parseFloat(data[i].humidity);
    sum_humidity += data[i].humidity;
  }

  var avg_humidity = sum_humidity/data.length;

  var counter = 0;
  var warningArray = new Array();



  for(i = 0; i < data.length; i++) {
    var value = parseFloat(data[i].humidity);
    var flow_string = parseFloat(data[i].flow);
    var diff_value = Math.abs(avg_humidity - value);
    var deviation = diff_value/avg_humidity;

    if(deviation > 0.2) {
      warningArray[counter] = data[i];
      warningArray[counter].deviation = (deviation*100).toFixed(3);

      var humidityArrayString = new Array(deviation.lenght).fill("hum");
      ++counter;
      console.log(humidityArrayString);
      console.log(deviation);

    }

  }

  const dataTable = $('#warnings').DataTable({
    data: warningArray,
    aoColumns: [
      { title: 'Humidity (%)', mData: 'humidity'},
      { title: 'Time', mData: 'start_time' },
      { title: 'Deviation from average value (%)', mData: 'deviation' },

      { mRender: function(data, type, full) {
        return '<a class="btn btn-danger btn-sm">' + 'Delete warning' + '</a>';
      }}

    ]
  });

  $('#button_id').click( function () {
    console.log("HEJ");
    dataTable.row('.active').remove();
  });


  $(".btn").bind( "click", function(event) {
    console.log("HEJ");
    var target_row = $(this).closest("tr").get(0); // this line did the trick
    console.log(target_row);
    target_row.remove();

});



}
