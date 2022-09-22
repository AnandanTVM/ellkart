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






}