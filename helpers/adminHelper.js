
var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const { catagary_COLLECTION } = require('../config/collection')
var objectId = require('mongodb').ObjectId
require("dotenv").config()
const authToken=process.env.AUTH_TOKEN
const accountSID=process.env.ACCOUNTS_ID
const serviceID=process.env.SERVICE_ID

const client = require('twilio')(accountSID,authToken)

module.exports = {
    //admin login
    doAdminLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            // let p = parseInt(adminData.phone)
            let admin = await db.get().collection(collection.Admin_COLLECTION).findOne({ phone: adminData.phone })
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

        products.stock = parseInt(products.stock)
        products.retailerPrice = parseInt(products.retailerPrice)
        products.mrp = parseInt(products.mrp)


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

        return new Promise((resolve, reject) => {

            data.stock = parseInt(data.stock)
            data.retailerPrice = parseInt(data.retailerPrice)
            data.mrp = parseInt(data.mrp)

            db.get().collection(collection.product_COLLECTION).updateOne({
                _id: ObjectId(proId)
            },
                {
                    $set: {
                        productName: data.productName,
                        brand: data.brand,
                        catagary: data.catagary,
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
                        highlights: data.highlights,
                        offer: data.offer

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
                    .services(serviceID)
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
                    .services(serviceID)
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
    //find all odders
    Allodders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let odders = await db.get().collection(collection.Odder_COLLECTION).aggregate([{
                    $match: { status: { $nin: ['Waiting For Approval'] } }

                }]).sort({ _id: -1 }).toArray()

                resolve(odders)
            } catch {
                reject()
            }


        })

    },
    odderDetails: (odderId) => {
        return new Promise(async (resolve, reject) => {

            let odderdetails = await db.get().collection(collection.Odder_COLLECTION).find({ _id: objectId(odderId) }).toArray()
            console.log(odderdetails);
            resolve(odderdetails)

        })

    },
    getoddersProductDetails: (odderId) => {
        return new Promise(async (resolve, reject) => {
            let odderProductDetils = await db.get().collection(collection.Odder_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(odderId) }
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
            console.log(error)
        })
    },
    //odder cancel
    cencelodder: (ordId, remark) => {
        return new Promise((resolve, reject) => {
            let status = "Canceled"
            console.log(ordId);
            db.get().collection(collection.Odder_COLLECTION).updateOne({
                _id: ObjectId(ordId)
            },
                {
                    $set: {
                        status: status,
                        remark: remark

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
    updateOdderstatus: (ordId, status) => {
        console.log(status);
        let s1 = status
        return new Promise((resolve, reject) => {

            console.log(ordId);
            db.get().collection(collection.Odder_COLLECTION).updateOne({
                _id: ObjectId(ordId)
            },
                {
                    $set: {
                        status: s1,


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
    //count total user
    usercount: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.user_COLLECTION).count().then((count) => {

                resolve(count)
            }).catch((err) => {
                reject(err)
            })
        })

    },
    productcount: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.product_COLLECTION).count().then((count) => {

                resolve(count)
            }).catch((err) => {
                reject(err)
            })
        })

    },
    odderctcount: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.Odder_COLLECTION).find({ status: { $ne: 'Canceled' } }).count().then((count) => {

                resolve(count)
                console.log("odder count :" + count);
            }).catch((err) => {
                reject(err)
            })
        })

    },
    totalSalse: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.get().collection(collection.Odder_COLLECTION).aggregate([
                    {
                        $match: { status: { $ne: 'Canceled' } }
                    },
                    {
                        $project: {
                            total: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$total' }
                            //arrayElemAt userd to convert array to object
                        }
                    }
                ]).toArray()
                resolve(total[0].total)
            } catch {
                console.log("error occers");
                reject()
            }
        })

    },
    weeklySeals: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let slase = await db.get().collection(collection.Odder_COLLECTION).aggregate([
                    {
                        $group: {
                            _id: "$month",
                            count: {
                                $count: {}
                            }
                        }
                    }
                ]).toArray()

                resolve(slase)
            } catch {
                reject()
            }

        })



    },

    getProductReport: () => {
        currentYear = new Date().getFullYear();
        return new Promise(async (resolve, reject) => {
            let ProductReport = await db
                .get()
                .collection(collection.Odder_COLLECTION)
                .aggregate([

                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            product: 1
                        }
                    },
                    {
                        $group: {
                            _id: "$product.iteam",
                            count: { $sum: "$product.quantity" },
                        }

                    },
                    {
                        $lookup: {
                            from: "product",
                            localField: "_id",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                    {
                        $unwind: "$product",
                    },
                    {
                        $project: {
                            name: "$product.productName",
                            count: 1,
                            _id: 0

                        },

                    }, { $sort: { count: -1 } }

                ])
                .toArray();
            console.log(ProductReport);

            resolve(ProductReport);
        });
    },
    getTotalSalesReport: () => {
        // giving total sales report (including all the status,payment method,date) no fileteration is given

        return new Promise(async (res, rej) => {
            let SalesReport = await db
                .get()
                .collection(collection.Odder_COLLECTION)
                .aggregate([
                    {
                        $lookup: {
                            from: collection.user_COLLECTION,
                            localField: "userId",
                            foreignField: "_id",
                            as: "users",
                        },
                    },
                    {
                        $lookup: {
                            from: collection.product_COLLECTION,
                            localField: "product.iteam",
                            foreignField: "_id",
                            as: "product",
                        },
                    },
                ])
                .toArray();

            res(SalesReport);
        });
    },

    allReturn: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let odders = await db.get().collection(collection.Odder_COLLECTION).aggregate([{
                    $match: { status: 'Waiting For Approval' }

                }]).sort({ _id: -1 }).toArray()

                resolve(odders)
            } catch {
                reject()
            }


        })

    },
    returnApprovel: (ordId) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.Odder_COLLECTION).updateOne({
                _id: ObjectId(ordId)
            },
                {
                    $set: {

                        status: 'Approval'
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
    allcoupen: () => {
        return new Promise(async (resolve, reject) => {
            let coupen = await db.get().collection(collection.Coupen_COLLECTION).find().toArray()
            resolve(coupen)

        })
    },
    addCoupen: (details) => {
        return new Promise(async (resolve, reject) => {
            let code = await db.get().collection(collection.Coupen_COLLECTION).findOne({ code: details.code })
            console.log(code);
            if (code) {
                reject({ message: 'Coupons already exist.' })
            } else {
                db.get().collection(collection.Coupen_COLLECTION).insertOne(details).then((data) => {
                    resolve(data)
                })
            }


        })



    },

    coupenDelect: (coupenId) => {
        return new Promise((resolve, reject) => {
            console.log("h1");
            db.get().collection(collection.Coupen_COLLECTION).deleteOne({ _id: ObjectId(coupenId) }).then((data) => {

                resolve(data)

            })
        })
    },
}