
var data_load_text = document.getElementById('data-load');
data_load_text.innerHTML = "Status: Waiting for request.";



$(function filter() {
  $('input[name="daterange"]').daterangepicker({
    opens: 'right'
  }, function(start, end, label) {
    var dataset = 'bike';
    data_load_text.innerHTML = "Status: Requesting " + (100.0 - 100.0 / 20).toFixed(2);
    data_load_text.innerHTML += "% reduced data between " + start.format('YYYY-MM-DD') + " and " + end.format('YYYY-MM-DD') + " from server...";

    console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));

    var t0 = performance.now();

    var requestURL = '/api/data_range?dataset=' + dataset + '&start=' + start.format('YYYY-MM-DD') + "&end=" + end.format('YYYY-MM-DD') + "&decimate=" + 20;
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onload = function() {

      // Check and display errors. There's probably a better way but this is just for testing.
      if (request.status != 200)
      {
        data_load_text.innerHTML = "Status: Error " + request.status.toString() + " " + request.statusText + ".";
        if (request.response.hasOwnProperty('errors'))
        {
          data_load_text.innerHTML += " ";
          for (var i = 0; i < request.response.errors.length; i++)
          {
            data_load_text.innerHTML += "[" + request.response.errors[i].msg + "] ";
          }
        }
        return;
      }

      var data = request.response;

      var t1 = performance.now();
      data_load_text.innerHTML = "Status: Data loaded in " + (t1 - t0).toFixed(0) + " ms.";

      if(data.length == 0)
      {
        data_load_text.innerHTML += " No data satisfies the request."
        return;
      }

      drawChart(data);

      /*
      drawChart() now does this with updating values.
      infoBox(data);
      */
    }
  });
});
