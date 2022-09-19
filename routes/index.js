const { response } = require('express');
var express = require('express');
var router = express.Router();
var gustHelper = require('../helpers/gustHelper')

/* GET home page. */
router.get('/', function (req, res, next) {
  gustHelper.getAllProducts().then((product) => {
    res.render('index', { title: 'ELL Kart ', product });
  })

});

//user home
router.get('/userHome', (req, res) => {
  let user = req.session.user


})

module.exports = router;
