/********************************************************************
Probably should change display style between "inline" and "none" also.
I've tried setTimeout(...) to delay the display change until opacity is
done transitioning and it works when you fade out, but opacity seems to 
automatically be set to 1.0 as soon as you change to inline display so 
it doesen't work when you fade in. There's probably a solution.
*********************************************************************/
var show_dots = true;
function toggleStationDots()
{
	show_dots = !show_dots;
	d3.selectAll("g.station_dots").style("opacity", +show_dots);
}