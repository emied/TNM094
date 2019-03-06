function infoBox(data) {

  var cross_filter = crossfilter(data);

  var distSum = 0;
  data.forEach(function(d) {
    distSum += +d.distance;
  });

  var avgVel = 0;
  var counter = 0;
  data.forEach(function(d) {
    avgVel += +d.speed;
    ++counter
  });
  avgVel = (avgVel/counter).toFixed(2);



	document.getElementById('info-box-1').innerHTML = "<h5>" + Math.round(distSum)/1000 + " km" + "</h5><h4>" + "<br>" + "Total Distance" + "</h4>" ;

  document.getElementById('info-box-2').innerHTML = "<h5>" + avgVel + " km/h" + "</h5><h4>" + "<br>" + "Average Velocity" + "</h4>" ;

}
