module.exports = {
    "mongoUri": "mongodb://" + process.env.IP + ":27017",
    "dbName": "shurl_db",
    "baseUrl": "http://" + process.env.IP + ":8080/",
    "port": process.env.PORT,
}