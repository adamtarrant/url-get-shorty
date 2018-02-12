//Connect to DB module takes args object, an operation to do whilst connected to DB an action do after that operation has finished i.e. returned some data

const mongo = require('mongodb').MongoClient;

module.exports = function(dbOpsArgs,dataBaseOperation, dbAfterActions) {
        mongo.connect(dbOpsArgs.mongoUri, (err, db) => {
            dataBaseOperation(err, db, dbOpsArgs, result => db.close(), dbAfterActions); 
        });
    }