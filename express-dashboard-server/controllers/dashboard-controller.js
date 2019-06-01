/***************************************
Returns range of decimated historic data
***************************************/
exports.dashboard = function(req, res) {
	var { data, view } = req.query;

	var title = data.charAt(0).toUpperCase() + data.slice(1) + " Dashboard";

	if(data == "bike" && view == 'Overview')
	{
		res.render('bike-dashboard/view-1', { title: title });
	}
	else if (data == "bike" && view == 'List')
	{
		res.render('bike-dashboard/view-2', { title: title });
	}
	else if (data == 'bike' && view == 'help')
	{
		res.render('bike-dashboard/view-help', { title: 'Help' });
	}
	else if(data == "compressor" && view == "Main")
	{
		res.render('compressor-dashboard/view-main', { title: title });
	}
	else if(data == "compressor" && view == "compressor")
	{
		res.render('compressor-dashboard/view-compressor', { title: title })
	}

	else
	{
		res.send("Incorrect URL");
	}
};
