

const express = require('express');
const router = express.Router();
const adminHelper = require('../helpers/adminHelper')

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
    req.session.adloggedIn = false;
    res.redirect('/admin')
})

//login with OTP
router.get('/adminLoginOtp', (req, res) => {

    if (req.session.adloggedIn) {
        let admin = req.session.admin
        res.redirect('./adminHome')
    } else {
        res.render('admin/adminLoginOtp', { title: 'admin Login', "logginErr": req.session.loginErr });
        req.session.loginErr = false
    }


})
//resent otp
router.get('/adminResendOtp', (req, res) => {
    res.redirect('./adminLoginOtp')


})

router.post('/adminLoginOtp', (req, res) => {

    adminHelper.getDetails(req.body.phone).then((response) => {
        let phone = req.body.phone
        if (response.phoneFound) {
            req.session.admin = response.details
            res.render('admin/adminEnterOtp', { title: "Admin login with otp", phone })
        } else {
            req.session.loginErr = true
            res.redirect('./adminLoginOtp')

        }


    })

})
//OTP Verification

router.post('/adminOtpEnter', (req, res) => {
    const otp = req.body.OTP;
    let phone = req.body.phone;
    adminHelper.veriOtp(otp, phone).then((vetify) => {
        console.log(vetify);
        if (vetify) {
            req.session.adloggedIn = true
            // req.session.admin = admin
            console.log("otp success");
            res.redirect('/admin/adminHome')
        } else {
            console.log("otp failed");
            req.session.loginErr = true
            res.redirect('./adminLoginOtp')
        }
    })

})

//user list info
router.get('/adminUserList', verifyLogin, (req, res) => {
    let admin = req.session.admin
    adminHelper.getAllUser().then((user) => {
        let count = user.length;
        res.render('admin/adminUserList', { title: "ELL Admin", ad: true, admin, user, count })
    })

})
//block user
router.get('/adminUserBlock/:usId', verifyLogin, (req, res) => {

    adminHelper.blockUser(req.params.usId).then(() => {
        res.redirect('../adminUserList')
    })
})
//unblock user
router.get('/adminUserunblock/:usId', verifyLogin, (req, res) => {

    adminHelper.unblockUser(req.params.usId).then(() => {
        res.redirect('../adminUserList')
    })
})

// catagary manage ment
router.get('/adminCatagary', verifyLogin, (req, res) => {
    let admin = req.session.admin
    adminHelper.getAllcatagary().then((cat) => {
        //    let count=cat.length;
        console.log(cat);
        res.render('admin/adminCatagaery', { title: "ELL Admin", ad: true, admin, cat })
    })
})


router.post('/addcatagarory', verifyLogin, (req, res) => {

    adminHelper.addcatagarory(req.body).then((response) => {

        res.redirect('/admin/adminCatagary')
    })
})

//delect catagary
router.get('/adminCatagaryDelect/:usId', verifyLogin, (req, res) => {
    console.log("here");
    let catid = req.params.usId

    adminHelper.catDelect(catid).then((response) => {
        res.redirect('/admin/adminCatagary')
    })


})


//add product router
router.get('/adminAddeProduct', verifyLogin, (req, res) => {
    let admin = req.session.admin
    // adminHelper.addcatagarory().then((catagary) => {
    // })

    adminHelper.getAllCatgary().then((catagary) => {
        console.log(catagary);
        res.render('admin/adminAddProduct', { title: "Add Products", ad: true, admin, catagary })
    })

})

router.post('/adminAddProduct', verifyLogin, (req, res) => {
    let admin = req.session.admin

    adminHelper.adminAddProduct(req.body, (result) => {
        let photo1 = req.files.photo1;
        photo1.mv('./public/product-photo1/' + result + '.jpg')

        let photo2 = req.files.photo2;
        photo2.mv('./public/product-photo2/' + result + '.jpg')
        let photo3 = req.files.photo3;
        photo3.mv('./public/product-photo3/' + result + '.jpg', (err, done) => {
            if (!err) {
                res.render('admin/adminAddProduct', { title: "Add Products", ad: true, admin, done: true })
            }
            else {
                console.log(err);
            }
        })

    })
})

//view Product
router.get('/adminViewProduct', verifyLogin, (req, res) => {
    let admin = req.session.admin
    adminHelper.getAllProducts().then((product) => {
        let count = product.length;
        res.render('admin/adminProductManagement', { title: "ELL Admin", ad: true, admin, product, count })
    })

})
//view Product in admin side
router.get('/adminViewProductEdit/:pid', verifyLogin, async (req, res) => {

    let proId = req.params.pid
    catagary = await adminHelper.getAllCatgary();

    adminHelper.getProducts(proId).then((product) => {

        res.render('admin/adminViewProduct', { title: "ELL Admin", ad: true, product, catagary })
    })


})
//Edit Product
router.post('/adminEditProduct/:id', verifyLogin, (req, res) => {
    console.log("on post");
    adminHelper.updateProduct(req.params.id, req.body).then(() => {

        res.redirect('../adminViewProduct')
        if (req.files.photo1) {
            let photo1 = req.files.photo1;
            photo1.mv('./public/product-photo1/' + req.params.id + '.jpg')
        }
        if (req.files.photo2) {
            let photo2 = req.files.photo2;
            photo2.mv('./public/product-photo2/' + req.params.id + '.jpg')
        }
        if (req.files.photo3) {
            let photo3 = req.files.photo3;
            photo3.mv('./public/product-photo1/' + req.params.id + '.jpg')
        }
    })
})
// Delect Product
router.get('/adminDelProduct/:id', verifyLogin, (req, res) => {
    let proId = req.params.id

    adminHelper.deleteProduct(proId).then((response) => {
        res.redirect('../adminViewProduct')
    })

})

module.exports = router;
