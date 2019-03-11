/***************************************************

test_erica.js

Just a simple test, if the outcome is relevent
it will be added to the master branch.

***************************************************/

function testChart(data) {

	var chart = dc.seriesChart('#line');
	var mycrossfilter = crossfilter(data);

        data.forEach(function(x) {
           if(x.gender == 'Male') {
              x.newdata = 1;
           } else {
              x.newdata = 2;
           }
				 })

        var hwDimension = mycrossfilter.dimension(function(data) {
           return [data.gender, data.height];
        });
        var hwGroup = hwDimension.group().reduceCount();

        chart
           .width(200)
           .height(200)
           .chart(function(c) {
              return dc.lineChart(c).interpolate('cardinal').evadeDomainFilter(true);
           })
					 .x(d3.scaleTime().domain([0, 100]))
           .elasticY(true)
           .brushOn(false)
           .xAxisLabel("x-axel")
           .yAxisLabel("y-axel")
           .dimension(hwDimension)
           .group(hwGroup)
           .seriesAccessor(function(d) { return d.key[0];})
           .keyAccessor(function(d) { return +d.key[1]; })
           .valueAccessor(function(d) { return +d.value; })
           .legend(dc.legend().x(350).y(500).itemHeight(13).gap(5).horizontal(1)
              .legendWidth(120).itemWidth(60));

        chart.render();

	// Super ugly solution but prevents this from showing before chart is loaded.
	document.getElementById('t1').innerHTML = " bike rides out of ";
	document.getElementById('t2').innerHTML = " selected. | ";
	document.getElementById('t3').innerHTML = " Reset All";


}
