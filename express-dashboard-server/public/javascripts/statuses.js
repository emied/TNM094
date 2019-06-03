var prev_statuses = [0, 0, 0];

function updateTriangle(statuses)
{
	$('#warning-count').html(statuses[1]);
	$('#broken-count').html(statuses[2]);

	var old_color = 'rgba(255,255,255,.5)';
	var new_color = old_color; 

	if(prev_statuses[2] != statuses[2])
	{
		new_color = $('#broken-count').css("color");
	}
	else if(prev_statuses[1] != statuses[1])
	{
		new_color = $('#warning-count').css("color");
	}
	
	var t = d3.transition()
		.duration(1000/2)
		.ease(d3.easeQuadInOut);

	d3.select('#warning-triangle')
		.transition(t)
		.style("color", new_color)
		.transition(t)
		.style("color", old_color)

	prev_statuses = statuses;
}

$(document).ready(() => {
	d3.json('./api/get_compressors_statuses').then( statuses => {
		prev_statuses = statuses;
		updateTriangle(statuses);
	});

	socket.on("statuses", statuses => {
		updateTriangle(statuses);
	});

});