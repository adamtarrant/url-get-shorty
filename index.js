//NPM and Node-core modules
const express = require('express');
const mongo = require('mongodb').MongoClient;
const path = require('path');

//Custom modules
const checkUrl = require('./js_modules/checkUrl.js');
const connectToDb = require('./js_modules/connectToDb.js');
const findOneInDb = require('./js_modules/findOneInDb.js');
const redirectUser = require('./js_modules/redirectUser.js');
const checkUrlExists = require('./js_modules/checkUrlExists.js');
const findMaxId = require('./js_modules/findMaxId.js');
const insertNewUrlDoc = require('./js_modules/insertNewUrlDoc.js');
const returnInsertedJson = require('./js_modules/returnInsertedJson.js');
const returnExistingDocJson = require('./js_modules/returnExistingDocJson.js')

//Config
const config = require('./config/config_dev.js');

const app = express();

//route handlers
app.use(express.static(path.join(__dirname, 'public')));

app.get('/:shurl', function checkShurlAndRedirCallB(req, res) {

    try {
        let dbOpsArgs = {
            "query": +req.params.shurl,
            "mongoUri": config.mongoUri,
            "dbName": config.dbName
        };
        //Connect to db, perform findOne, after action is to redirect user or display url not valid message
        connectToDb(dbOpsArgs, findOneInDb, (err, doc) => {
            redirectUser(err, doc, res);
        });

    }
    catch (error) {
        console.log(error);
        res.writeHead(500, {
            "Content-Type": "text/plain"
        });
        res.end("There was an error on the server");
    }
});

app.get('/create/:url', function checkAndCreateShurl(req, res) {
    try {

        if (checkUrl(req.params.url)) { // check if valid url
            let dbOpsArgs = {
                "query": req.params.url,
                "mongoUri": config.mongoUri,
                "dbName": config.dbName
            };
            connectToDb(dbOpsArgs, checkUrlExists, (err, docExist, db, dbOpsArgs) => {
                if (docExist == null) {
                    findMaxId(err, db, dbOpsArgs, req.params.url, insertNewUrlDoc, (err, result, newDoc) => {
                        db.close();
                        returnInsertedJson(err, res, config.baseUrl, newDoc);
                    });
                }
                else {
                    db.close();
                    returnExistingDocJson(res, req.params.url, config.baseUrl, docExist);
                }
            });
        }
        else {
            res.writeHead(400, {
                "Content-Type": "text/plain"
            });
            res.end("400: Bad request. Please submit a full valid url as the parameter including www domain");
        }
    }
    catch (error) {
        console.log(error);

        res.writeHead(500, {
            "Content-Type": "text/plain"
        });
        res.end("There was an error on the server");
    }
});

app.all('/*', (req, res) => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Page not found. Please submit shortened url or use /create/<url> to create a shortened url");
});

app.listen(config.port);
