module.exports = function findOneInDb(err, db, dbOpsArgs, dbAfterActions) {
        console.log('query should be ' + dbOpsArgs.query);
        if (err) throw err;
        let dbo = db.db(dbOpsArgs.dbName);
        dbo.collection('urls').findOne({ short_url: dbOpsArgs.query }, (err,doc) => {
            dbAfterActions(err,doc);
        });
    }