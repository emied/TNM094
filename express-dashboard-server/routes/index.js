/************************************************************************************************************

index.js

Handles all routes for homepage calls, i.e. when a URL with the pattern http://localhost:3000 is requested.

Usually just defines the homepage by rendering a HTML (using PUG) as the response.

************************************************************************************************************/

var express = require('express');
var router = express.Router();

var dashboard_controller = require('../controllers/dashboard-controller');

router.get('/', function(req, res, next) {
	res.redirect('dashboard?data=bike&view=Overview');
});

router.get('/dashboard', dashboard_controller.dashboard);

module.exports = router;
