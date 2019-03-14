/***************************************
Returns range of decimated historic data
***************************************/
exports.dashboard = function(req, res) {
	var { data, view } = req.query;

  var title = "Dashboard: " + data.charAt(0).toUpperCase() + data.slice(1) + " View " + view;

  if(data == "bike" && view == 1)
  {
    res.render('bikes/bike-view1', { title: title });
  }
  else if (data == "bike" && view == 2)
  {
    res.render('bikes/bike-view2', { title: title });
  }
  else if (data == "bike" && view == 3)
  {
    res.render('bikes/bike-view3', { title: title });
  }
	else if (data = "bike" && view == 4)
  {
    res.render('bikes/bike-warning', { title: title });
  }

  else
  {
    res.send("Incorrect URL");
  }
};
