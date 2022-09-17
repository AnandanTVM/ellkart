var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
var objectId = require('mongodb').ObjectId


module.exports = {

    userRegister: async (userData, callback) => {
        return new Promise(async (resolve, reject) => {
            //remove unwated feild from object
            delete userData.passwordConfirm


            let extphone = await db.get().collection(collection.user_COLLECTION).findOne({ phone: userData.phone })
            console.log(extphone);
            if (extphone == null) {
                console.log("i am harae");
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
                if(user.block)
                {
                    resolve({ status: false })

                }else{
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



    }






}