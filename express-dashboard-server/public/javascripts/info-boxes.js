function infoBox(data) {

  var cross_filter = crossfilter(data);

  var test = cross_filter.dimension(function(d) {
    var distance = d.distance;
    return distance;
  });

  var distSum = 0;
  data.forEach(function(d) {
    distSum += +d.distance;


  });


  console.log(distSum);







	document.getElementById('info-box-1').innerHTML = "Total distance: " + Math.round(distSum)/1000 + " km";


}
