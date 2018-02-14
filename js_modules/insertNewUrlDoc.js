module.exports = function insertNewUrlDoc(db, dbOpsArgs, maxIdDoc, original_url, returnInsertedJson) {
    console.log(maxIdDoc);
    let dbo = db.db(dbOpsArgs.dbName);
    let newDoc = {
        "original_url": original_url,
        "short_url": +maxIdDoc.short_url + 1
    };
    console.log('entered insert new doc 2');
    dbo.collection('urls').insertOne(newDoc, (err, result) => {
        console.log('insert complete');
        if (err) throw err;
        returnInsertedJson(err, result, newDoc);
    });
}
