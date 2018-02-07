const express = require('express');
const mongo = require('mongodb').MongoClient;
const checkUrl = require('./checkUrl.js');

const port = process.env.PORT || 8080;

const app = express();

const baseUrl = "http://localhost:8080/"


app.get('/create/:url', (req, res) => {

    try {

        if (checkUrl(req.params.url)) { // check if valid url

            mongo.connect('mongodb://localhost:27017', (err, db) => { //connect to mongo
                if (err) throw err;
                let dbo = db.db('shurl_db');
                //find and return to var url in collection if it exists
                let docExist = dbo.collection('urls').findOne({
                    orig_url: req.params.url
                }, (err, result) => {
                    if (err) throw err;
                    return result;
                });
                console.log(docExist);
                //check if url exists in collection
                if (docExist == undefined) {
                    var newDoc;
                    dbo.collection('urls').find().sort({
                        'short_url': -1
                    }).limit(1).forEach(doc => {
                        //create newdoc ready for insertion

                        if (doc == undefined) {
                            newDoc = {
                                "orig_url": req.params.url,
                                "short_url": 1
                            };
                        } else {
                            newDoc = {
                                "orig_url": req.params.url,
                                "short_url": doc.short_url + 1
                            };
                        }

                        dbo.collection('urls').insertOne(newDoc, (err, result) => { // instert new url
                            if (err) throw err;
                            //console.log(result);
                            //console.log(newId);
                            let shurl = {
                                original_url: req.params.url,
                                short_url: baseUrl + result.ops[0].short_url
                            };
                            db.close();
                            res.writeHead(200, {
                                "Content-Type": "text/plain"
                            });
                            res.end(JSON.stringify(shurl));
                        });

                    });

                } else {
                    let resJSON = {
                        original_url: req.params.url,
                        short_url: baseUrl + '/' + newId
                    };
                    db.close();
                    res.writeHead(200, {
                        "Content-Type": "text/plain"
                    });
                    res.end(JSON.stringify(resJSON));
                }

            });

        } else {
            res.writeHead(400, {
                "Content-Type": "text/plain"
            });
            res.end("400: Bad request. Please submit a full valid url as the parameter including www domain");
        }



    } catch (error) {
        console.log(error);

        res.writeHead(500, {
            "Content-Type": "text/plain"
        });
        res.end("There was an error on the server");
    }
});

app.listen(port);