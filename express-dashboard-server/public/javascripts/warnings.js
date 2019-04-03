function warnings(data) {

  console.log(data.length);

  for(i = 0; i < data.length; i++) {

  }

  const dataTable = $('#warnings').DataTable({
    data: data,
    aoColumns: [
      { title: 'Humidity', mData: 'humidity' }
    ]

  });


}
