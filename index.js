//NPM and Node-core modules
const express = require('express');
const mongo = require('mongodb').MongoClient;
const path = require('path');

//Custom modules
const checkUrl = require('./js_modules/checkUrl.js');
const connectToDb = require('./js_modules/connectToDb.js');
const findOneInDb = require('./js_modules/findOneInDb.js');
const redirectUser = require('./js_modules/redirectUser.js');

//Config
const config = require('./config/config_dev.js');

const app = express();

//route handlers
app.use(express.static(path.join(__dirname, 'public')));

app.get('/:shurl', checkShurlAndRedirCallB);

app.get('/create/:url', (req, res) => {


    try {

        if (checkUrl(req.params.url)) { // check if valid url

            mongo.connect(config.mongoUri, (err, db) => { //connect to mongo
                if (err) throw err;
                let dbo = db.db(config.dbName);
                //find and return to var url in collection if it exists
                let docExist;
                dbo.collection('urls').findOne({ //use find one module already written. dbAfterAction is like next() convention. Each one has it and it can pass it on to the next if it exists
                    original_url: req.params.url
                }, function(err, result) {
                    if (err) throw err;
                    docExist = result;
                    console.log('findOne =' + docExist);
                    //check if url exists in collection
                    if (docExist == null) {
                        console.log('made it to if statement');

                        dbo.collection('urls').find().sort({
                            'short_url': -1
                        }).limit(1).forEach(doc => {
                            //create newdoc ready for insertion
                            console.log('forEach sort = ' + doc);
                            let newDoc = {
                                "original_url": req.params.url,
                                "short_url": doc.short_url + 1
                            };



                            dbo.collection('urls').insertOne(newDoc, (err, result) => { // instert new url
                                if (err) throw err;
                                //console.log(result);
                                //console.log(newId);
                                let resJSON = {
                                    original_url: req.params.url,
                                    short_url: config.baseUrl + newDoc.short_url
                                };
                                console.log('doc inserted and about to close connection');
                                db.close();
                                res.writeHead(200, {
                                    "Content-Type": "text/plain"
                                });
                                res.end(JSON.stringify(resJSON));
                            });
                        });


                    }
                    else {
                        console.log('didnt insert anything and about to close connection');
                        let resJSON = {
                            original_url: req.params.url,
                            short_url: config.baseUrl + docExist.short_url
                        };
                        db.close();
                        res.writeHead(200, {
                            "Content-Type": "text/plain"
                        });
                        res.end(JSON.stringify(resJSON));
                    }
                });

            }); //end of mongo client connect

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


//Function declarations

//Validate and redirect for short url - handler
function checkShurlAndRedirCallB(req, res) {

    try {
        let dbOpsArgs = {
            "query": +req.params.shurl,
            "mongoUri": config.mongoUri,
            "dbName": config.dbName
        };
        //Connect to db, perform findOne, after action is to redirect user or display url not valid message
        connectToDb(dbOpsArgs, findOneInDb, (err,doc) => {
            if (err) throw err; 
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
}

