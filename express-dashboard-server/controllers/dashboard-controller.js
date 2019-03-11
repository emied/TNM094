/***************************************
Returns range of decimated historic data
***************************************/
exports.dashboard = function(req, res) {
	var { data, view } = req.query;

  if(data = "bike" && view == 1)
  {
    res.render('bikes/bike-view1');
  }
  else if (data = "bike" && view == 2)
  {
    res.render('bikes/bike-view2');
  }
  else if (data = "bike" && view == 3)
  {
    res.render('bikes/bike-view3');
  }

  else
  {
    res.send("Incorrect URL");
  }
};
