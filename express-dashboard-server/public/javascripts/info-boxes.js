function infoBox(data) {

  var cross_filter = crossfilter(data);

  var distSum = 0;
  data.forEach(function(d) {
    distSum += +d.distance;
  });

  var avgSpeed = 0;
  var counter = 0;
  data.forEach(function(d) {
    avgSpeed += +d.speed;
    ++counter
  });
  avgSpeed = (avgSpeed/counter).toFixed(2);

  // Gave the text a class to only style these elements and swapped the order.
  // Also changed velocity to speed (velocity has a direction)
  document.getElementById('info-box-1').innerHTML = "<h4 class='info-box-text'><br>Total Distance</h4>";
  document.getElementById('info-box-1').innerHTML += "<h5 class='info-box-text'>" + Math.round(distSum)/1000 + " km</h5>";

  document.getElementById('info-box-2').innerHTML = "<h4 class='info-box-text'><br>Average Speed</h4>";
  document.getElementById('info-box-2').innerHTML += "<h5 class='info-box-text'>" + avgSpeed + " km/h</h5>";

//Belive this way is wrong but idk it wont work tho
  document.getElementById('war-box-1').innerHTML = "<h4 class='info-box-text'><br>Total Distance</h4>";
  document.getElementById('war-box-1').innerHTML += "<h5 class='info-box-text'>" + Math.round(distSum)/1000 + " km</h5>";

  document.getElementById('war-box-2').innerHTML = "<h4 class='info-box-text'><br>Average Speed</h4>";
  document.getElementById('war-box-2').innerHTML += "<h5 class='info-box-text'>" + avgSpeed + " km/h</h5>";
}
