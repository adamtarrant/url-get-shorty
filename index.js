const express = require('express');
const mongo = require('mongodb').MongoClient;
const checkUrl = require('./checkUrl.js');
const path = require('path');
const mongoUri = 'mongodb://heroku_dlwx7mjs:a6m5de2deknbd9u112efp9vuf1@ds127888.mlab.com:27888/heroku_dlwx7mjs';
const ip = process.env.IP;
const hostName = 'url-get-shorty.herokuapp.com';
const port = process.env.PORT || 8080;

const app = express();

const baseUrl = "http://" + hostName + "/"

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:shurl', (req, res) => {
    mongo.connect(mongoUri, function(err, db) {
        console.log(req.params.shurl);
        if (err) throw err;
        let dbo = db.db('heroku_dlwx7mjs');

        dbo.collection('urls').findOne({ short_url: +req.params.shurl }, function(err, doc) {
            if (err) throw err;
            console.log(doc);
            if (doc) {
                res.redirect(301, 'https://' + doc.original_url);
            }
            else {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("This shortened url does not exist. Please use /create/<url> call to create a shortened url");
            }
            db.close();
        });
    });
});

app.get('/create/:url', (req, res) => {

    try {

        if (checkUrl(req.params.url)) { // check if valid url

            mongo.connect(mongoUri, (err, db) => { //connect to mongo
                if (err) throw err;
                let dbo = db.db('heroku_dlwx7mjs');
                //find and return to var url in collection if it exists
                let docExist;
                dbo.collection('urls').findOne({
                    original_url: req.params.url
                }, function(err, result) {
                    if (err) throw err;
                    docExist = result;
                    console.log('findOne = ' + docExist);
                    //check if url exists in collection
                    if (docExist == null) {
                        console.log('made it to if statement');
                        var newDoc;

                        dbo.collection('urls').find().sort({
                            'short_url': -1
                        }).limit(1).forEach(doc => {
                            //create newdoc ready for insertion
                            console.log('forEach sort = ' + doc);
                            newDoc = {
                                "original_url": req.params.url,
                                "short_url": doc.short_url + 1
                            };



                            dbo.collection('urls').insertOne(newDoc, (err, result) => { // instert new url
                                if (err) throw err;
                                //console.log(result);
                                //console.log(newId);
                                let resJSON = {
                                    original_url: req.params.url,
                                    short_url: baseUrl + newDoc.short_url
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
                            short_url: baseUrl + docExist.short_url
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

app.listen(port);
