
var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
var objectId = require('mongodb').ObjectId


module.exports = {
    //admin login
    doAdminLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let p = parseInt(adminData.phone)
            let admin = await db.get().collection(collection.Admin_COLLECTION).findOne({ phone: p })

            if (admin) {
                if (adminData.password == admin.password) {

                    response.admin = admin
                    response.status = true
                    resolve(response)
                }
            } else {
                console.log("you are here");
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
    
    blockUser:(usrId)=>{
        console.log("i am here");
        
       const ousrId =objectId(usrId)
       console.log(ousrId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.user_COLLECTION)
            .updateOne({_id:ousrId},
            {$set:{
                block:true
            }
        }).then((response)=>{
            resolve()
        })
        console.log("outside")
        })
        
    },
    //UNblock user
    
    unblockUser:(usrId)=>{
        console.log("i am here");
        
       const ousrId =objectId(usrId)
       console.log(ousrId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.user_COLLECTION)
            .updateOne({_id:ousrId},
            {$set:{
                block:false
            }
        }).then((response)=>{
            resolve()
        })
        console.log("outside")
        })
        
    }

}