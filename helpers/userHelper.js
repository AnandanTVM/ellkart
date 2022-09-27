var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
var objectId = require('mongodb').ObjectId
const config = require('../config/otpConfig')
const client = require('twilio')(config.accountSID, config.authToken)

module.exports = {

    userRegister: async (userData, callback) => {
        return new Promise(async (resolve, reject) => {
            //remove unwated feild from object
            delete userData.passwordConfirm


            let extphone = await db.get().collection(collection.user_COLLECTION).findOne({ phone: userData.phone })
            console.log(extphone);
            if (extphone == null) {

                return new Promise(async (resolve, reject) => {


                    userData.password = await bcrypt.hash(userData.password, 10)

                    db.get().collection(collection.user_COLLECTION).insertOne(userData).then((data) => {

                        resolve(data)
                    })

                })
                    .then((data) => {
                        resolve(data)
                    })

            } else {

                resolve({ phoneFound: true })
            }
            console.log("done");


        })




    },
    //user login here
    douserLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.user_COLLECTION).findOne({ phone: userData.phone })
            if (user) {
                if (user.block) {
                    resolve({ status: false })

                } else {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {

                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {

                            resolve({ status: false })
                        }
                    })
                }

            } else {

                resolve({ status: false })
            }
        })



    },
    //get all product
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.product_COLLECTION).find().toArray()
            resolve(product)
        })

    },
    //view a product
    getProducts: (pId) => {

        return new Promise(async (resolve, reject) => {

            let product = await db.get().collection(collection.product_COLLECTION).findOne({ _id: ObjectId(pId) });
            resolve(product);
        })
    },
    // user otp
    //find adimin exitent
    getDetails: (data) => {
        return new Promise(async (resolve, reject) => {
            let phone = data

            let details = await db.get().collection(collection.user_COLLECTION).findOne({ phone: data })
            console.log(details);
            if (details == null) {
                resolve({ phoneFound: false })
            } else {
                //otp sending process starts
                console.log(phone)
                phone = "+91" + phone

                client
                    .verify
                    .services(config.serviceID)
                    .verifications
                    .create({
                        to: phone,
                        channel: "sms",
                    })
                    .then((data) => {
                        resolve({ phoneFound: true, details })
                        console.log('otp Sending successfully to ' + phone);
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve({ phoneFound: false })
                    })

            }
        })

    },
    veriOtp: (OTP, phone) => {

        return new Promise(async (res, rej) => {
            phone = "+91" + phone
            // chcking the otp

            if (OTP.length == 4) {
                await client
                    .verify
                    .services(config.serviceID)
                    .verificationChecks
                    .create({
                        to: phone,
                        code: OTP
                    })
                    .then((data) => {
                        console.log(data)
                        if (data.status == 'approved') {
                            otpverify = true;
                        } else {
                            otpverify = false
                        }

                    })
            } else {

                otpverify = false
            }
            console.log(otpverify)
            res(otpverify)

        })
    },
    //Add to cart 

    addTocart: (proId, userId) => {
        let proObj = {
            iteam: ObjectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.cart_COLLECTION).findOne({ user: ObjectId(userId) })



            if (userCart) {
                let proExt = userCart.productId.findIndex(productId => productId.iteam == proId)
                if (proExt != -1) {
                    db.get().collection(collection.cart_COLLECTION).updateOne(
                        { user: objectId(userId), 'productId.iteam': objectId(proId) },
                        {
                            $inc: { 'productId.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    //pushing to cart
                    db.get().collection(collection.cart_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {

                            $push: { productId: proObj }

                        }).then((responce) => {
                            resolve()
                        })
                }


            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    productId: [proObj]
                }

                db.get().collection(collection.cart_COLLECTION).insertOne(cartObj).then((responce) => {
                    resolve()
                })
            }




        })


    },

    getCartDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartIteam = await db.get().collection(collection.cart_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }

                },

                {
                    $unwind: '$productId'
                }, {
                    $project: {
                        iteam: '$productId.iteam',
                        quantity: '$productId.quantity'
                    }
                },
                {
                    //to join anothtre table fields to current table
                    $lookup: {
                        from: collection.product_COLLECTION,
                        localField: 'iteam',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        iteam: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        //arrayElemAt userd to convert array to object
                    }
                }

            ]).toArray()


            resolve(cartIteam)
        })
    },

    //to get total 


    getTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.cart_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }

                },

                {
                    $unwind: '$productId'
                }, {
                    $project: {
                        iteam: '$productId.iteam',
                        quantity: '$productId.quantity'
                    }
                },
                {
                    //to join anothtre table fields to current table
                    $lookup: {
                        from: collection.product_COLLECTION,
                        localField: 'iteam',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        iteam: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        //arrayElemAt userd to convert array to object
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.retailerPrice'] } }
                        //arrayElemAt userd to convert array to object
                    }
                }

            ]).toArray()
            console.log(total[0].total);

            resolve(total[0].total)
        })
    },
    //view  cart count
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.cart_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {

                count = cart.productId.length
            }
            resolve(count)
        })

    },
    //change qunty
    userChangeQunty: (details) => {
        count = parseInt(details.count)
        quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.cart_COLLECTION).
                    updateOne({ _id: objectId(details.cart) },
                        {
                            //delecting that array object
                            $pull: { productId: { iteam: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.cart_COLLECTION).updateOne(

                    { _id: objectId(details.cart), 'productId.iteam': objectId(details.product) },
                    {
                        $inc: { 'productId.$.quantity': count }
                    }
                ).then((responce) => {
                    resolve({ status: true })
                })


            }


        })
    },
    //remove cart
    removeCart: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.cart_COLLECTION).
                updateOne({ _id: objectId(details.cart) },
                    {
                        //delecting that array object
                        $pull: { productId: { iteam: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
    placeOdder: (odder, product, total) => {
        return new Promise((resolve, reject) => {
            console.log("this from project helpers");

            let status = odder.paymentmethod === 'COD' ? 'placed' : 'pending'
            let odderObj = {
                deliveryDetails: {
                    name: odder.fastname + " " + odder.lastname,
                    mobile: odder.mobile,
                    address: odder.house + "," + odder.area + " ," + odder.landmark + "," + odder.city + "," + odder.state,

                    pincode: odder.pincode
                },
                userId: objectId(odder.userId),
                paymentmethod: odder.paymentmethod,
                product: product, email: odder.emailid,
                total: total,
                date: new Date(),
                status: status

            }
            db.get().collection(collection.Odder_COLLECTION).insertOne(odderObj).then((response) => {
                db.get().collection(collection.cart_COLLECTION).remove({ user: objectId(odder.userId) })
                resolve()
            })

            console.log(odderObj);
        })

    },
    getcartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.cart_COLLECTION).findOne({ user: objectId(userId) })
            console.log("cart :" + cart.productId);
            resolve(cart.productId)
        })


    }


}