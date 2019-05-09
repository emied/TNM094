$(document).ready(() => {
	var prev_statuses = [0, 0, 0];
	io().on("statuses", statuses => {
		$('#warning-count').html(statuses[1]);
		$('#broken-count').html(statuses[2]);

		//var old_color = $('#warning-triangle').css("color");
		var new_color = prev_statuses[2] != statuses[2] ? $('#broken-count').css("color") : $('#warning-count').css("color");

		var t = d3.transition()
			.duration(1000/2)
			.ease(d3.easeQuadInOut);

		d3.select('#warning-triangle')
			.transition(t)
			.style("color", new_color)
			.transition(t)
			.style("color", 'rgba(255,255,255,.5)')

    prev_statuses = statuses;
	});
});