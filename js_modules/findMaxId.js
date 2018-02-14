module.exports = function findMaxId(err, db, dbOpsArgs, original_url, insertNewUrlDoc, returnInsertedJson) {
    console.log('entered max id');
    if (err) throw err;
    let dbo = db.db(dbOpsArgs.dbName);
    dbo.collection('urls').find().sort({
        'short_url': -1
    }).limit(1).forEach((maxIdDoc) => {
        insertNewUrlDoc(db, dbOpsArgs, maxIdDoc, original_url, returnInsertedJson);
    });

}
