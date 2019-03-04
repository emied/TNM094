/************************************************************************************************************

index.js

Handles all routes for homepage calls, i.e. when a URL with the pattern http://localhost:3000 is requested.

Usually just defines the homepage by rendering and HTML (using PUG) as the response.

************************************************************************************************************/

var express = require('express');
var router = express.Router();

/*************************************************************************************
Defines what should happen when http://localhost:3000 is requested with method GET.
Renders the homepage.
*************************************************************************************/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dashboard' });
});

module.exports = router;
