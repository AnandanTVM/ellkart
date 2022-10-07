const { response } = require('express');
const express = require('express');
const router = express.Router();
const gustHelper = require('../helpers/gustHelper')

/* GET home page. */
router.get('/', function (req, res, next) {
  gustHelper.getAllProducts().then((product) => {
    res.render('index', { title: 'ELL Kart ', product });
  }).catch((error) => {
    
    res.render('./notfount')
  })

});

//view product

router.get('/productView/:pid', (req, res) => {

  let proId = req.params.pid
  gustHelper.getProducts(proId).then((product) => {

    res.render('./gustProductView', { title: product.productName, product })
  }).catch((error) => {
    
    res.render('./notfount')
  })


})

module.exports = router;
