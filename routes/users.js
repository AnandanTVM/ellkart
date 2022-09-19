const { response } = require('express');
var express = require('express');
var router = express.Router();
var userHelper = require('../helpers/userHelper')
const verifyLogin = (req, res, next) => {
  if (req.session.usloggedIn) {
    next()
  } else {
    res.redirect('user/userLogin')
  }
}

//use4r sungup
router.get('/userSingup', (req, res) => {
  res.render('user/userSinup', { title: 'User Singup' })
})

router.post('/userSinghup', (req, res) => {

  userHelper.userRegister(req.body).then((response) => {

    if (response.phoneFound) {
      res.render("user/userSinup", { title: "User Singup", phfound: true })
    } else {
      res.render("user/userSinup", { title: "User Singup", Done: true })
    }

  })
})
//user Login
router.get('/userLogin', (req, res) => {
  if (req.session.usloggedIn) {
    let user = req.session.user
    res.render('user/userHome', { title: "User Home", us: true, user })
  } else {
    res.render('user/userLogin', { title: 'User Login', "logginErr": req.session.loginErr })
    req.session.loginErr = false
  }


})

router.post('/userLogin', (req, res) => {


  userHelper.douserLogin(req.body).then((response) => {

    if (response.status) {

      req.session.usloggedIn = true
      req.session.user = response.user
      console.log(req.session.user);
      res.redirect('/user/userHome')
    } else {

      req.session.loginErr = true
      res.redirect('/user/userLogin',)
    }

  })
})
//logout

router.get('/userLogout', (req, res) => {
  req.session.destroy()
  res.redirect('/user/userLogin')
})
//user home
router.get('/userHome', (req, res) => {
  let user = req.session.user
  userHelper.getAllProducts().then((product) => {
    res.render('user/userHome', { title: "user Home", us: true, user, product })
  })

})



module.exports = router;
