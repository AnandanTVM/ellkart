const { response } = require('express');
const express = require('express');
const router = express.Router();
const gustHelper = require('../helpers/gustHelper')

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
