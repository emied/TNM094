function getWarnings(data)
{
  var cross_filter = crossfilter(data);
  var minute_dimension = cross_filter.dimension(function(d) {
    var minute = new Date(d.start_time);
    minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
    return minute;

  });

  var standard_dev_humidity = 

}
