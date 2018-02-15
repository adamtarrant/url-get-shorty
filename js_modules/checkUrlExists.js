module.exports = function checkUrlExists(err, db, dbOpsArgs, dbNextAction) {
        console.log(dbOpsArgs.query);
        if (err) throw err;
        let dbo = db.db(dbOpsArgs.dbName);
        dbo.collection('urls').findOne({ "original_url": dbOpsArgs.query }, (err, docExist) => {
                console.log(docExist);
                dbNextAction(err, docExist, db, dbOpsArgs);
        });
}
