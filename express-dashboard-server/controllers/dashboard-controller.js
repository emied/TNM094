/***************************************
Returns range of decimated historic data
***************************************/
exports.dashboard = function(req, res) {
	var { data, view } = req.query;

  var title = data.charAt(0).toUpperCase() + data.slice(1) + " Dashboard";

  if(data == "bike" && view == 1)
  {
    res.render('bike-dashboard/view-1', { title: title });
  }
  else if (data == "bike" && view == 2)
  {
    res.render('bike-dashboard/view-2', { title: title });
  }
  else if (data == "bike" && view == 3)
  {
    res.render('bike-dashboard/view-3', { title: title });
  }
	else if (data = "bike" && view == "warning")
  {
    res.render('bike-dashboard/view-warning', { title: title });
  }

  else
  {
    res.send("Incorrect URL");
  }
};
