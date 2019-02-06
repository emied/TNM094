var monthly_bubble_chart = dc.bubbleChart('#monthly-bubble-chart');
var year_bar_chart = dc.barChart('#year-bar-chart');
var age_bar_chart = dc.barChart('#age-bar-chart');
var speed_bar_chart = dc.barChart('#speed-bar-chart');
var gender_pie_chart = dc.pieChart('#gender-pie-chart');
var day_of_week_chart = dc.rowChart('#day-of-week-chart');
var hour_of_day_chart = dc.barChart('#hour-of-day-chart');
var count_chart = dc.dataCount("#count-chart");

function remove_empty_bins(source_group) {
  return {
    all: function() {
      return source_group.all().filter(function(d) {
        return d.value.count != 0;
      });
    }
  };
}

d3.csv("data/fordgobike_mhd_reduced_all.csv").then(function(data) {

  var date_format_parser = d3.timeParse(d3.timeFormat('%Y %m-%d %H:%M:%S'));

  data.forEach(function(d) {
    d.date = date_format_parser('2018 ' + d.start_time);
    d.days = new Date(d.date);
    d.days.setHours(0, 0, 0, 0);
  });

  var cross_filter = crossfilter(data);

  var monthly_dimension = cross_filter.dimension(function(d) {
    var month = d.days.getMonth();
    var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return name[month];
  });
  var monthly_group = monthly_dimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum_speed += v.speed * 1.0;
      p.sum_age += v.age * 1.0;
      p.avg_speed = p.count > 0 ? p.sum_speed / p.count : 0;
      p.avg_age = p.count > 0 ? p.sum_age / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum_speed -= v.speed * 1.0;
      p.sum_age -= v.age * 1.0;
      p.avg_speed = p.count > 0 ? p.sum_speed / p.count : 0;
      p.avg_age = p.count > 0 ? p.sum_age / p.count : 0;
      return p;
    },

    function() {
      return {
        count: 0,
        sum_speed: 0.0,
        sum_age: 0,
        avg_speed: 0.0,
        avg_age: 0.0
      };
    }
  );
  non_empty_month_group = remove_empty_bins(monthly_group);

  var day_dimension = cross_filter.dimension(function(d) {
    return d.days;
  });
  day_group = day_dimension.group().reduceCount();

  var age_dimension = cross_filter.dimension(function(d) {
    return d.age;
  });
  var age_group = age_dimension.group().reduceCount();

  var gender_dimension = cross_filter.dimension(function(d) {
    if (d.gender == 1) { return 'Male'; }
    if (d.gender == 2) { return 'Female'; } 
    else               { return 'Other'; }
  });
  var gender_group = gender_dimension.group().reduceCount();

  var speed_dimension = cross_filter.dimension(function(d) {
    return Math.round(d.speed);
  });
  var speed_group = speed_dimension.group().reduceCount();

  var dow_dimension = cross_filter.dimension(function(d) {
    var day = d.days.getDay();
    var name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return day + '.' + name[day];
  });
  var dow_group = dow_dimension.group();

  var hod_dimension = cross_filter.dimension(function(d) {
    return d.date.getHours();
  });
  var hod_group = hod_dimension.group();

  monthly_bubble_chart
    .width(1450)
    .height(400)
    .dimension(monthly_dimension)
    .group(non_empty_month_group)

    .keyAccessor(function(p) {
      return p.value.avg_speed;
    })

    .valueAccessor(function(p) {
      return p.value.avg_age;
    })

    .radiusValueAccessor(function(p) {
      return p.value.count / (3000);
    })

    .colorAccessor(function(d) {
      return d.key;
    })

    .x(d3.scaleLinear().domain([9.6, 14]))
    .y(d3.scaleLinear().domain([31, 38]))
    .r(d3.scaleLinear().domain([0, 20]))

    .elasticY(true)
    .elasticX(true)
    .yAxisPadding(2)
    .xAxisPadding(0.07)

    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)

    .xAxisLabel('Average Speed (km/h)')
    .yAxisLabel('Average Age (yr)')

    .renderLabel(true)
    .label(function(p) {
      return p.key;
    });

  year_bar_chart
    .width(1450)
    .height(150)
    .x(d3.scaleTime().domain([new Date(2018, 0, 1), new Date(2018, 11, 31)]))
    .round(d3.timeDay.round)
    .xUnits(d3.timeDays)
    .yAxisLabel("")
    .elasticY(true)
    .elasticX(false)
    .dimension(day_dimension)
    .group(day_group);

  gender_pie_chart
    .width(200)
    .height(180)
    .dimension(gender_dimension)
    .group(gender_group);

  age_bar_chart
    .width(350)
    .height(210)
    .x(d3.scaleLinear().domain([19, 76]))
    .yAxisLabel("")
    .xAxisLabel("Age (yr)")
    .elasticY(true)
    .elasticX(false)
    .dimension(age_dimension)
    .group(age_group);

  speed_bar_chart
    .width(340)
    .height(210)
    .x(d3.scaleLinear().domain([0, 30]))
    .yAxisLabel("")
    .xAxisLabel("Speed (km/h)")
    .elasticY(true)
    .elasticX(false)
    .dimension(speed_dimension)
    .group(speed_group);

  day_of_week_chart
    .width(250)
    .height(200)
    .group(dow_group)
    .dimension(dow_dimension)
    .label(function(d) {
      return d.key.split('.')[1];
    })
    .title(function(d) {
      return d.value;
    })
    .elasticX(true)
    .xAxis().ticks(4);

  hour_of_day_chart
    .width(330)
    .height(210)
    .x(d3.scaleLinear().domain([0, 24]))
    .yAxisLabel("")
    .xAxisLabel("Hour")
    .elasticY(true)
    .elasticX(false)
    .dimension(hod_dimension)
    .group(hod_group);

  count_chart
    .dimension(cross_filter)
    .group(cross_filter.groupAll());

  dc.renderAll();

});