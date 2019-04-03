var flow_chart = dc.lineChart('#line-chart-compressor');
var pressure_chart = dc.lineChart('#line-chart-pressure');
var humidity_chart = dc.lineChart('#line-chart-humidity');
var bearing_vibration = dc.lineChart('#line-chart-bearing-vibration');
var oil_temp_chart = dc.lineChart('#line-chart-oil-temp');
var ambient_temp_chart = dc.lineChart('#line-chart-amb-temp');

function drawChartCompressor(data)
{
  var cross_filter = crossfilter(data);
  var minute_dimension = cross_filter.dimension(function(d) {
    var minute = new Date(d.start_time);
    minute.setHours(minute.getHours(), minute.getMinutes(), 0, 0);
    return minute;

  });


  var avg_flow_group = minute_dimension.group().reduce(
  function(p, v){
      ++p.count;
      p.sum_flow += +v.flow;
      p.avg_flow = p.count ? (p.sum_flow/p.count) : 0;

      return p;
  },
  function(p, v){
      --p.count;
      p.sum_flow -= +v.flow;
      p.avg_flow = p.count ? (p.sum_flow/p.count) : 0;

      return p;
  },
  function(){
      return{
        count: 0,
        sum_flow: 0.0,
        avg_flow: 0.0
      }
    }
  );

  var avg_pressure_group = minute_dimension.group().reduce(
  function(p,v){
      ++p.count;
      p.sum_pressure += +v.oil_pressure;
      p.avg_pressure = p.count ? (p.sum_pressure/p.count) : 0;

      return p;
  },

  function(p,v){
      --p.count;
      p.sum_pressure -= +v.oil_pressure;
      p.avg_pressure = p.count ? (p.sum_pressure/p.count) : 0;

      return p;
  },

    function(){
      return{
        count: 0,
        sum_pressure: 0.0,
        avg_pressure: 0.0
      }
    }

  );

  var avg_humidity_group = minute_dimension.group().reduce(
    function(p,v){
      ++p.count;
      p.sum_humidity += +v.humidity;
      p.avg_humidity = p.count ? (p.sum_humidity/p.count) : 0;

      return p;
    },

    function(p,v){
      --p.count;
      p.sum_humidity-= +v.humidity;
      p.avg_humidity = p.count ? (p.sum_humidity/p.count) : 0;

      return p;
    },

    function(){
      return{
        count: 0,
        sum_humidity: 0.0,
        avg_humidity: 0.0
      }
    }

  );

  var avg_bearing_vibration_group = minute_dimension.group().reduce(
    function(p, v){
      ++p.count;
      p.sum_bearing_vibration += +v.bearing_vibration;
      p.avg_bearing_vibration = p.count ? (p.sum_bearing_vibration/p.count) : 0;

      return p;
    },
    function(p, v){
      --p.count;
      p.sum_bearing_vibration-= +v.bearing_vibration;
      p.avg_bearing_vibration= p.count ? (p.sum_bearing_vibration/p.count) : 0;

      return p;
    },
    function(){
      return{
        count: 0,
        sum_bearing_vibration: 0.0,
        avg_bearing_vibration: 0.0
      }
    }
  );

  var avg_oil_temp_group = minute_dimension.group().reduce(
    function(p, v){
      ++p.count;
      p.sum_oil_temp += +v.oil_temp;
      p.avg_oil_temp = p.count ? (p.sum_oil_temp/p.count) : 0;

      return p;
    },
    function(p, v){
      --p.count;
      p.sum_oil_temp-= +v.oil_temp;
      p.avg_oil_temp= p.count ? (p.sum_oil_temp/p.count) : 0;

      return p;
    },
    function(){
      return{
        count: 0,
        sum_oil_temp: 0.0,
        avg_oil_temp: 0.0
      }
    }
  );


  var avg_amb_temp_group = minute_dimension.group().reduce(
    function(p, v){
      ++p.count;
      p.sum_amb_temp += +v.ambient_temp;
      p.avg_amb_temp = p.count ? (p.sum_amb_temp/p.count) : 0;

      return p;
    },
    function(p, v){
      --p.count;
      p.sum_amb_temp-= +v.ambient_temp;
      p.avg_amb_temp= p.count ? (p.sum_amb_temp/p.count) : 0;

      return p;
    },
    function(){
      return{
        count: 0,
        sum_amb_temp: 0.0,
        avg_amb_temp: 0.0
      }
    }
  );

// flow chart
  flow_chart
    .width($('#line-chart-compressor').width())
    .height(200)
    .margins({left: 50, top: 20, bottom: 20, right:0})
    .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
    .elasticX(true)
    .elasticY(true)
    .yAxisLabel("Flow (L/min)")
    .dimension(minute_dimension)
    .group(avg_flow_group)
    .valueAccessor(function(d) {
      return d.value.avg_flow;
    });


//oil pressure
  pressure_chart
    .width($('#line-chart-pressure').width())
    .height(200)
    .margins({left: 50, top: 20, bottom: 20, right:0})
    .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
    .elasticX(true)
    .elasticY(true)
    .yAxisLabel("Oil Pressure (Bar)")
    .dimension(minute_dimension)
    .group(avg_pressure_group)
    .valueAccessor(function(d) {
      return d.value.avg_pressure;
    });


//humidity
    humidity_chart
      .width($('#line-chart-humidity').width())
      .height(200)
      .margins({left: 50, top: 20, bottom: 20, right:0})
      .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
      .elasticX(true)
      .elasticY(true)
      .yAxisLabel("Humidity (%)")
      .dimension(minute_dimension)
      .group(avg_humidity_group,'humidity percentage')
      .valueAccessor(function(d) {
        return d.value.avg_humidity;
      });


//bearing_vibration
      bearing_vibration
        .width($('#line-chart-bearing-vibration').width())
        .height(200)
        .margins({left: 50, top: 20, bottom: 20, right:0})
        .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel("Bearing Vibration (mm/s)")
        .dimension(minute_dimension)
        .group(avg_bearing_vibration_group)
        .valueAccessor(function(d) {
          return d.value.avg_bearing_vibration;
        });

      oil_temp_chart
        .width($('#line-chart-oil-temp').width())
        .height(200)
        .margins({left: 50, top: 20, bottom: 20, right:0})
        .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel("Oil Temp (°C)")
        .dimension(minute_dimension)
        .group(avg_oil_temp_group)
        .valueAccessor(function(d) {
          return d.value.avg_oil_temp;
          });

      ambient_temp_chart
        .width($('#line-chart-amb-temp').width())
        .height(200)
        .margins({left: 50, top: 20, bottom: 20, right:0})
        .x(d3.scaleTime().domain([new Date(2018, 0, 0), new Date(2020, 0, 0)]))
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel("Ambient Temp (°C)")
        .dimension(minute_dimension)
        .group(avg_amb_temp_group)
        .valueAccessor(function(d) {
          return d.value.avg_amb_temp;
        });

        //display infoboxes
        //ambint temp
        var avg_amb_temp_display = dc.numberDisplay("#info-box-1");

  			var avg_amb_temp_display_group= cross_filter.groupAll().reduce(
  				function (p, v) {
  					++p.count;
  					p.sum_amb_temp_display += +v.ambient_temp;

  					return p;
  				},
  				function (p, v) {
  					--p.count;
  					p.sum_amb_temp_display -= +v.ambient_temp;

  					return p;
  				},
  				function () {
  					return {
  						count: 0,
  						sum_amb_temp_display: 0.0
  					};
  				}
  			);


  			avg_amb_temp_display
  				.formatNumber(d3.format(".2f"))
  				.valueAccessor(d => { return d.count ? (d.sum_amb_temp_display / (d.count)) : 0 })
  				.html({some: "<h4 class='info-box-text'><br>Average Ambient Temperature</h4><h5 class='info-box-text'>%number °C</h5>"})
  				.group(avg_amb_temp_display_group);



          //flow
          var avg_flow_display = dc.numberDisplay("#info-box-2");
          var avg_flow_display_group= cross_filter.groupAll().reduce(
            function (p, v) {
              ++p.count;
              p.sum_flow_display += +v.flow;

              return p;
            },
            function (p, v) {
              --p.count;
              p.sum_flow_display -= +v.flow;

              return p;
            },
            function () {
              return {
                count: 0,
                sum_flow_display: 0.0
              };
            }
          );

          avg_flow_display
            .formatNumber(d3.format(".2f"))
            .valueAccessor(d => { return d.count ? (d.sum_flow_display / ((d.count)*60000)) : 0 })
            .html({some: "<h4 class='info-box-text'><br>Average Flow</h4><h5 class='info-box-text'>%number m<sup>3</sup>/s</h5>"})
            .group(avg_flow_display_group);

          //infobox vibration
          var avg_vibration_display = dc.numberDisplay("#info-box-3")
          var avg_vibration_display_group = cross_filter.groupAll().reduce(
            function (p, v) {
              ++p.count;
              p.sum_vibration_display += +v.bearing_vibration;

              return p;
            },
            function (p, v) {
              --p.count;
              p.sum_vibration_display -= +v.bearing_vibration;

              return p;
            },
            function () {
              return {
                count: 0,
                sum_vibration_display: 0.0
              };
            }
          );

          avg_vibration_display
            .formatNumber(d3.format(".2f"))
            .valueAccessor(d => { return d.count ? (d.sum_vibration_display / (d.count)) : 0 })
            .html({some: "<h4 class='info-box-text'><br>Average Bearing Vibration</h4><h5 class='info-box-text'>%number mm/s<sup>2</sup></h5>"})
            .group(avg_vibration_display_group);

          //oil tremperature
          var avg_oil_temp_display = dc.numberDisplay("#info-box-4")
          var avg_oil_temp_display_group = cross_filter.groupAll().reduce(
            function (p, v) {
              ++p.count;
              p.sum_oil_temp_display += +v.oil_temp;

              return p;
            },
            function (p, v) {
              --p.count;
              p.sum_oil_temp_display -= +v.oil_temp;

              return p;
            },
            function () {
              return {
                count: 0,
                sum_oil_temp_display: 0.0
              };
            }
          );

          avg_oil_temp_display
            .formatNumber(d3.format(".2f"))
            .valueAccessor(d => { return d.count ? (d.sum_oil_temp_display / (d.count)) : 0 })
            .html({some: "<h4 class='info-box-text'><br>Average Oil Temperature</h4><h5 class='info-box-text'>%number °C</h5>"})
            .group(avg_oil_temp_display_group);




          /// find standard deviation


  dc.renderAll();



}
