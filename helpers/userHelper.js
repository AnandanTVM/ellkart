var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId, Db } = require('mongodb')
const { response, json } = require('express')
var objectId = require('mongodb').ObjectId
const config = require('../config/otpConfig')
const client = require('twilio')(config.accountSID, config.authToken)
const Razorpay = require('razorpay');
const { resolve } = require('path')

let instance = new Razorpay({
    key_id: 'rzp_test_V6c4v4ekLUGUMI',
    key_secret: 'NvToocEHI8Ke1w62zSKVY45r',
});

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

                    }).catch((error) => {
                        reject(error)
                    })

                })
                    .then((data) => {
                        resolve(data)

                    }).catch((error) => {
                        console.log(error);
                        reject(error)
                        console.log();
                    })

            } else {

                resolve({ phoneFound: true })
            }
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
            try {
                let product = await db.get().collection(collection.product_COLLECTION).findOne({ _id: ObjectId(pId) });
                resolve(product);
            } catch {
                reject()
            }

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
            try {
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
                resolve(total[0].total)

            } catch {
                let total = 0
                resolve(total)
            }



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

            let d = new Date().toString();
            let index = d.lastIndexOf(':') + 3
            let date = (d.substring(0, index))
            let month = new Date().getMonth();
            switch (month) {
                case 0: month = "Jan"
                    break;
                case 1: month = "Feb"
                    break;
                case 2: month = "Mar"
                    break;
                case 3: month = "Apr"
                    break;
                case 4: month = "May"
                    break;
                case 5: month = "Jun"
                    break;
                case 6: month = "Jul"
                    break;
                case 7: month = "Aug"
                    break;
                case 8: month = "Sep"
                    break;
                case 9: month = "Aug"
                    break;
                case 10: month = "Nov"
                    break;
                case 11: month = "Dec"
                    break;
                default: console.log("someting wrong")
            }

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
                date: date,
                month: month,
                status: status

            }
            db.get().collection(collection.Odder_COLLECTION).insertOne(odderObj).then((response) => {
                db.get().collection(collection.cart_COLLECTION).remove({ user: objectId(odder.userId) })
                resolve(response)
            })

            console.log(odderObj);
        })

    },
    getcartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.cart_COLLECTION).findOne({ user: objectId(userId) })

            resolve(cart.productId)
        })


    },
    getodderdetails: (resId) => {
        return new Promise(async (resolve, reject) => {
            let odderDetils = await db.get().collection(collection.Odder_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(resId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        iteam: '$product.iteam',
                        quantity: '$product.quantity',
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
            console.log(odderDetils);
            resolve(odderDetils)
        })
    },
    //find all odder deatails
    getooderdetails: (userId) => {
        return new Promise(async (resolve, reject) => {

            let odderdetails = await db.get().collection(collection.Odder_COLLECTION).find({ userId: objectId(userId) }).sort({ _id: -1 }).toArray()
            console.log(odderdetails);
            resolve(odderdetails)

        })
    },
    //odder details
    getOdderdetails: (ordId) => {
        return new Promise(async (resolve, reject) => {

            let odderdetails = await db.get().collection(collection.Odder_COLLECTION).find({ _id: objectId(ordId) }).toArray()
            console.log(odderdetails);
            resolve(odderdetails)

        })
    },

    getOdderProductdetails: (ordId) => {
        return new Promise(async (resolve, reject) => {
            let odderProductDetils = await db.get().collection(collection.Odder_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(ordId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        iteam: '$product.iteam',
                        quantity: '$product.quantity',
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

            resolve(odderProductDetils)
        }).catch((error) => {
            reject(error)
        })
    },

    cencelodder: (ordId) => {
        return new Promise((resolve, reject) => {
            let status = "Canceled"
            console.log(ordId);
            db.get().collection(collection.Odder_COLLECTION).updateOne({
                _id: ObjectId(ordId)
            },
                {
                    $set: {
                        status: status

                    }

                }).then((response) => {
                    console.log(response);
                    resolve()
                }).catch((error) => {
                    console.log(error);
                    reject(error)
                })
        })
    },
    //address
    updateAddress: (userId, address) => {
        address.userId = objectId(userId)
        console.log(address);
        return new Promise(async (resolve, reject) => {
            let foundAddress = await db.get().collection(collection.Address_COLLECTION).findOne({ userId: objectId(userId) })
            console.log(foundAddress);
            if (foundAddress == null) {

                return new Promise(async (resolve, reject) => {

                    await db.get().collection(collection.Address_COLLECTION).insertOne(address).then((data) => {

                        resolve(data)

                    }).catch((error) => {
                        reject(error)
                    })

                })
                    .then((data) => {
                        resolve(data)

                    }).catch((error) => {
                        console.log(error);
                        reject(error)
                        console.log();
                    })

            } else {
                return new Promise(async (resolve, reject) => {

                    await db.get().collection(collection.Address_COLLECTION).updateOne({
                        userId: ObjectId(userId)
                    },
                        {
                            $set: {
                                fastname: address.fastname,
                                lastname: address.lastname,
                                emailid: address.emailid,
                                mobile: address.mobile,
                                pincode: address.pincode,
                                house: address.house,
                                area: address.area,
                                landmark: address.landmark,
                                city: address.city,
                                state: address.state,
                            }

                        }).then((response) => {
                            console.log(response);
                            resolve()
                        }).catch((error) => {
                            console.log(error);
                            reject(error)
                        })

                })
                    .then((data) => {
                        resolve(data)

                    }).catch((error) => {
                        console.log(error);
                        reject(error)
                        console.log();
                    })

            }

        })

    },
    getAddress: (userId) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.Address_COLLECTION).findOne({ userId: objectId(userId) }).then((data) => {
                resolve(data)
            }).catch((error) => {
                reject(error)
                console.log(error);
            })

        })



    },
    userinfoUpdate: (userId, data) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.user_COLLECTION).updateOne({
                _id: ObjectId(userId)
            },
                {
                    $set: {
                        email: data.email,
                        phone: data.phone

                    }

                }).then((response) => {
                    console.log("updated succesfully");
                    console.log(response);
                    resolve()
                }).catch((error) => {
                    console.log(error);
                    reject(error)
                })

        })

    },
    genarateRezopay: (ordId, total) => {
        return new Promise((resolve, reject) => {
            let options = {
                amount: total,
                currency: "INR",
                receipt: "" + ordId
            };
            instance.orders.create(options, function (err, order) {
                console.log(order)
                resolve(order)
            })

        })
    },

    verfiyPayment: (details) => {

        return new Promise((resolve, reject) => {

            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'NvToocEHI8Ke1w62zSKVY45r');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                console.log("mached");
                resolve()
            } else {
                console.log("not mached");
                reject()
            }

        })

    },
    changePayemengtStatus: (ordId) => {
        return new Promise((resolve, reject) => {
            let k = ordId
            console.log(k);
            db.get().collection(collection.Odder_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    paymentfailed: (ordId) => {
        return new Promise((resolve, reject) => {
            let k = ordId
            console.log(k);
            db.get().collection(collection.Odder_COLLECTION).updateOne({ _id: objectId(ordId) },
                {
                    $set: {
                        status: 'Canceled',
                        remark: 'due to online paymentfailed'
                    }
                }).then(() => {
                    resolve()
                })
        })
    },
    orderReturn: (ordId, reson) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.Odder_COLLECTION).updateOne({
                _id: ObjectId(ordId)
            },
                {
                    $set: {
                        reson: reson.returnReson,
                        status: 'Waiting For Approval'
                    }

                }).then(() => {

                    resolve()
                }).catch((error) => {
                    console.log(error);
                    reject(error)
                })


        })


    },
    //coupen
    getcoupen: () => {
        return new Promise(async (resolve, reject) => {
            let coupen = await db.get().collection(collection.Coupen_COLLECTION).find().toArray()
            resolve(coupen)

        })
    },
    checkCoupen: (code) => {
        return new Promise(async (resolve, reject) => {

            let coupen = await db.get().collection(collection.Coupen_COLLECTION).findOne({ code: code })
            if (coupen) {
                resolve(coupen)
            } else {
                console.log("here");
                reject()
            }




        })

    }





}