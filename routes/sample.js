var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/hello', function(req, res, next) {
  res.send('world');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('sample.html', { title: 'Express', message: 'Hello world' });
});



module.exports = router;
