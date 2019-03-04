function drawPie(data)
{


  var pie_chart = dc.pieChart('#pie-chart');
  var count_chart = dc.dataCount("#count-chart");

  var cross_filter = crossfilter(data);


  var genderDimension = cross_filter.dimension(function(data) {

    if (data.gender == 1) {
      test = "Male";
    }
    else if (data.gender == 2) {
      test = "Female";
    }
    else
      test = "Other"


    return test;
  });

  var genderGroup = genderDimension.group().reduceCount();



  pie_chart
		.width(700)
		.height(300)
    .dimension(genderDimension)
    .group(genderGroup)





   dc.renderAll();



}
