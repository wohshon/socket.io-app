var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //this is for the pug template
//  res.render('index', { title: 'Express' });
  //this is for the index.html
  res.render('index.html', { title: 'Express' });
});

/* GET home page. */
router.get('/test', function(req, res, next) {
  
//  res.render('test.html', { SERVER: 'http://192.168.0.110:8080' });
res.render('test.html', { SERVER: process.env.SERVER });
});

module.exports = router;
