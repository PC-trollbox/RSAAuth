const app = require("express")();
const fs = require("fs");
const crypto = require("crypto");

app.get("/", function(req, res) {
    if (req.query.token == fs.readFileSync(__dirname + "/secrettoken").toString()) return res.sendFile(__dirname + "/secretz.html")
    res.sendFile(__dirname + "/logonpage.html")
})

app.get("/registerPubKey", function(req, res) {
    if (!req.query.pubkey) return res.sendFile(__dirname + "/pubkey_uploader.html");
    fs.writeFileSync(__dirname + "/pubkey.key", req.query.pubkey);
    res.redirect("/");
});

app.get("/imagination.js", function(req, res) {
    res.sendFile(__dirname + "/RSADecEnc.js");
});

app.get("/getEncryptedSecret", function(req, res) {
    if (req.query.pubkey != fs.readFileSync(__dirname + "/pubkey.key").toString()) return res.status(401).send("Invalid Pubkey");
    res.send(crypto.publicEncrypt({
        key: req.query.pubkey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(fs.readFileSync(__dirname + "/secrettoken").toString(), "utf-8")).toString("base64"));
})

app.listen(3000, function() {
    console.log("It took years of preparation to finally do this POC.");
});