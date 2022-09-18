

var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/adminHelper')

const verifyLogin = (req, res, next) => {

    if (req.session.adloggedIn) {
        next()
    } else {
        res.redirect('/admin')
    }
}
/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.adloggedIn) {
        let admin = req.session.admin
        res.render('admin/adminHome', { title: 'admin Home', ad: true, admin })
    } else {
        res.render('admin/adminlogin', { title: 'admin Login', "logginErr": req.session.loginErr });
        req.session.loginErr = false
    }

});
//admin Login checks here
router.post('/', function (req, res, next) {
    console.log("you are here");
    adminHelper.doAdminLogin(req.body).then((response) => {
        console.log("you are here");
        if (response.status) {
            req.session.adloggedIn = true
            req.session.admin = response.admin
            res.redirect('/admin/adminHome')
        } else {
            req.session.loginErr = true
            res.redirect('/admin',)
        }

    })
});
//Admin home page
router.get('/adminHome', (req, res) => {
    let admin = req.session.admin
    res.render('admin/adminHome', { title: "Admin Home", ad: true, admin })

})
//logout

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})

//login with OTP
router.get('/adminLoginOtp', (req, res) => {
    console.log("i am otp login");
    res.render('admin/adminLoginOtp', { title: "Admin login" })
})





//add product router
router.get('/adminAddeProduct', verifyLogin, (req, res) => {
    
    let admin = req.session.admin
    res.render('admin/adminAddProduct', { title: "Add Products", ad: true, admin })
})

//user list info
router.get('/adminUserList',verifyLogin,(req,res)=>{
    let admin = req.session.admin
    adminHelper.getAllUser().then((user) => {
       let count=user.length;
        res.render('admin/adminUserList', {title : "ELL Admin",ad: true, admin,user,count })
      })
   
})
//block user
router.get('/adminUserBlock/:usId',verifyLogin,(req,res)=>{
    
    adminHelper.blockUser(req.params.usId).then(() => {
        res.redirect('../adminUserList')
      })
})
//unblock user
router.get('/adminUserunblock/:usId',verifyLogin,(req,res)=>{
   
    adminHelper.unblockUser(req.params.usId).then(() => {
        res.redirect('../adminUserList')
      })
})

// catagary manage ment
router.get('/adminCatagary',verifyLogin,(req,res)=>{
    let admin = req.session.admin
    adminHelper.getAllcatagary().then((cat) => {
//    let count=cat.length;
console.log(cat);
    res.render('admin/adminCatagaery', {title : "ELL Admin", ad: true, admin,cat })
    })
})


router.post('/addcatagarory',verifyLogin,(req,res)=>{

    adminHelper.addcatagarory(req.body).then((response) => {

        res.redirect('/admin/adminCatagary')
    })
})

//delect catagary
router.get('/adminCatagaryDelect/:usId',verifyLogin,(req,res)=>{
    console.log("here");
    let catid = req.params.usId
    
    adminHelper.catDelect(catid).then((response) => {
        res.redirect('/admin/adminCatagary')
    })
   

})

module.exports = router;
