
var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const { catagary_COLLECTION } = require('../config/collection')
var objectId = require('mongodb').ObjectId

const config = require('../config/otpConfig')
const client = require('twilio')(config.accountSID, config.authToken)


module.exports = {
    //admin login
    doAdminLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            // let p = parseInt(adminData.phone)
            let admin = await db.get().collection(collection.Admin_COLLECTION).findOne({phone:adminData.phone})
console.log(admin);
            if (admin) {
               
               
                if (adminData.password == admin.password) {

                    response.admin = admin
                    response.status = true
                    console.log("passed login");
                    resolve(response)
                }
                else {
                    console.log("failed login");
                    resolve({ status: false })
                }
            } else {
                console.log("failed login ");
                resolve({ status: false })
            }

        })



    },
    //user info getting here
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.user_COLLECTION).find().toArray()
            resolve(user)

        })
    },
    //block user

    blockUser: (usrId) => {
        console.log("i am here");

        const ousrId = objectId(usrId)
        console.log(ousrId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.user_COLLECTION)
                .updateOne({ _id: ousrId },
                    {
                        $set: {
                            block: true
                        }
                    }).then((response) => {
                        resolve()
                    })
            console.log("outside")
        })

    },
    //UNblock user

    unblockUser: (usrId) => {
        console.log("i am here");

        const ousrId = objectId(usrId)
        console.log(ousrId)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.user_COLLECTION)
                .updateOne({ _id: ousrId },
                    {
                        $set: {
                            block: false
                        }
                    }).then((response) => {
                        resolve()
                    })
            console.log("outside")
        })

    },
    //add catagary
    addcatagarory: (catagary) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.catagary_COLLECTION).insertOne(catagary).then((data) => {
                resolve(data)
            })

        })
    },

    //catagary info getting here
    getAllcatagary: () => {
        return new Promise(async (resolve, reject) => {
            let cat = await db.get().collection(collection.catagary_COLLECTION).find().toArray()
            resolve(cat)

        })
    },
    //delect catagary
    catDelect: (cat) => {
        return new Promise((resolve, reject) => {
            console.log("h1");
            db.get().collection(collection.catagary_COLLECTION).deleteOne({ _id: ObjectId(cat) }).then((data) => {

                resolve(data)

            })
        })
    },

    //add product
    adminAddProduct: (products, callback) => {
        console.log(products);
        products.stock=parseInt(products.stock)
        products.retailerPrice=parseInt(products.retailerPrice)
        products.mrp=parseInt(products.mrp)
        console.log(products);
        db.get().collection(collection.product_COLLECTION).insertOne(products).then((data) => {

            const id = data.insertedId.toString()
            console.log(id);
            callback(id)
        })


    },
    //get all product
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.product_COLLECTION).find().toArray()
            resolve(product)
        })

    },
    //view all catgary

    getAllCatgary: () => {
        return new Promise(async (resolve, reject) => {
            let catagary = await db.get().collection(collection.catagary_COLLECTION).find().toArray()
            resolve(catagary)
        })

    },
    //view a product
    getProducts: (pId) => {

        return new Promise(async (resolve, reject) => {

            let product = await db.get().collection(collection.product_COLLECTION).findOne({ _id: ObjectId(pId) });
            resolve(product);
        })
    },
    //Delect Products
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            console.log("h1");
            db.get().collection(collection.product_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((data) => {

                resolve(data)

            })
        })
    },
    // update product
    updateProduct: (proId, data) => {
        console.log("here");
        return new Promise((resolve, reject) => {
            db.get().collection(collection.product_COLLECTION).updateOne({
                _id: ObjectId(proId)
            },
                {
                    $set: {
                        productName: data.productName,
                        brand: data.brand,
                        Categorie: data.Categorie,
                        modelnumber: data.modelnumber,
                        mrp: data.mrp,
                        retailerPrice: data.retailerPrice,
                        highlights: data.highlights,
                        stock: data.stock,
                        inbox: data.inbox,
                        Type: data.Type,
                        madein: data.madein,
                        colour: data.colour,
                        width: data.width,
                        hight: data.hight,
                        wight: data.wight,
                        warranty: data.warranty,
                        highlights: data.highlights

                    }

                }).then((response) => {
                    resolve()
                })

        })
    },

    //find adimin exitent
    getDetails: (data) => {
        return new Promise(async (resolve, reject) => {
            let phone = data

            let details = await db.get().collection(collection.Admin_COLLECTION).findOne({ phone: data })
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

}