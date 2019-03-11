/***************************************
Returns range of decimated historic data
***************************************/
exports.dashboard = function(req, res) {
	var { data, view } = req.query;

  if(data = "bike" && view == 1)
  {
    res.render('bikes/bike-view1');
  }
  else
  {
    res.send("invalid!");
  }
};
