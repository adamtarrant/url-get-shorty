module.exports = function redirectUser(err, doc, res) {
    if (err) throw err;
    if (doc) {
        res.redirect(301, 'https://' + doc.original_url);
    }
    else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("This shortened url does not exist. Please use /create/<url> call to create a shortened url");
    }
}
