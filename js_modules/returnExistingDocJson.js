module.exports = function returnExistingDocJson(res, original_url, baseUrl, docExist) {
    console.log('entered return existing doc');
    let resJSON = {
        original_url: original_url,
        short_url: baseUrl + docExist.short_url
    };
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(JSON.stringify(resJSON));
}
