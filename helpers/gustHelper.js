var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const { catagary_COLLECTION } = require('../config/collection')
var objectId = require('mongodb').ObjectId


module.exports = {
    //get all product
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try{
            let product = await db.get().collection(collection.product_COLLECTION).find().toArray()
            console.log(product);
            resolve(product)
        }catch{
           
            reject()
        }
        })

    },//view a product
    getProducts: (pId) => {
      
            return new Promise(async (resolve, reject) => {
                try{
                let product = await db.get().collection(collection.product_COLLECTION).findOne({ _id: ObjectId(pId) });
                
                resolve(product);
            }catch{
                
                reject()
            }
            })
        

        
    },



}