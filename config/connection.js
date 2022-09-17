const mongoClient = require('mongodb').MongoClient
let state = {
    db: null

}
module.exports.connect = function (done) {
    //url
    const url = 'mongodb://localhost:27017'
    //database name
    const dbname = 'ellkart'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })

}
module.exports.get = function () {
    return state.db
}