function warnings(data) {

  console.log(data.length);

  var sum_humidity = 0;

  for(i = 0; i < data.length; i++) {
    data[i].humidity = parseFloat(data[i].humidity);
    sum_humidity += data[i].humidity;
  }

  var avg_humidity = sum_humidity/data.length;
  console.log(avg_humidity);
  var counter = 0;
  var warningArray = new Array();


  for(i = 0; i < data.length; i++) {
    var value = parseFloat(data[i].humidity);

    var diff_value = Math.abs(avg_humidity - value);
    var deviation = diff_value/avg_humidity;

    if(deviation > 0.2) {
      warningArray[counter] = data[i];
      ++counter;
    }
  }

  const dataTable = $('#warnings').DataTable({
    data: warningArray,
    aoColumns: [
      { title: 'Humidity', mData: 'humidity' }
    ]

  });


}
