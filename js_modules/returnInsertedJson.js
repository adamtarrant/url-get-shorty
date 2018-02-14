 module.exports = function returnInsertedJson(err, res, baseUrl, newDoc) {
     if (err) throw err;
     let resJSON = {
         original_url: newDoc.original_url,
         short_url: baseUrl + newDoc.short_url
     };
     res.writeHead(200, {
         "Content-Type": "text/plain"
     });
     res.end(JSON.stringify(resJSON));
 }
 