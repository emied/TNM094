/************************************************************************************************************

index.js

Handles all routes for homepage calls, i.e. when a URL with the pattern http://localhost:3000 is requested.

Usually just defines the homepage by rendering a HTML (using PUG) as the response.

************************************************************************************************************/

var express = require('express');
var router = express.Router();

/*************************************************************************************
Defines what should happen when http://localhost:3000 is requested with method GET.
Renders the homepage.
*************************************************************************************/
router.get('/', function(req, res, next) {
	// The .render() function uses PUG to render a HTML page as the response.
	// (since PUG was set as the view engine in app.js)
	res.render('index', { title: 'Dashboard' });
});

router.get('/bootstrap', function(req, res, next) {
	// The .render() function uses PUG to render a HTML page as the response.
	// (since PUG was set as the view engine in app.js)
	res.render('index_bootstrap', { title: 'Dashboard' });
});

module.exports = router;
