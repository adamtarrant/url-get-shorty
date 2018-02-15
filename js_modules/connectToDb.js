//Connect to DB module takes args object, an operation to do whilst connected to DB an action do after that operation has finished i.e. returned some data

const mongo = require('mongodb').MongoClient;

module.exports = function(dbOpsArgs,dataBaseOperation, dbNextAction) {
    console.log('entered connect to db');
        mongo.connect(dbOpsArgs.mongoUri, (err, db) => {
            let dbo = db.db(dbOpsArgs.dbName);
            dataBaseOperation(err, db, dbOpsArgs, dbNextAction); 
        });
    }