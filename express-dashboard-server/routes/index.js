/************************************************************************************************************

index.js

Handles all routes for homepage calls, i.e. when a URL with the pattern http://localhost:3000 is requested.

Usually just defines the homepage by rendering a HTML (using PUG) as the response.

************************************************************************************************************/

var express = require('express');
var router = express.Router();

var dashboard_controller = require('../controllers/dashboard-controller');

/*************************************************************************************
Defines what should happen when http://localhost:3000 is requested with method GET.
Renders the homepage.
*************************************************************************************/
router.get('/', function(req, res, next) {
	// The .render() function uses PUG to render a HTML page as the response.
	// (since PUG was set as the view engine in app.js)
	res.redirect('dashboard?data=bike&view=1');
});

/*************************************************************************************
Defines what should happen when http://localhost:3000 is requested with method GET.
Renders the homepage.
*************************************************************************************/
router.get('/dashboard', dashboard_controller.dashboard);



module.exports = router;
