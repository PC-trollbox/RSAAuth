const app = require("express")();
const fs = require("fs");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const user = {
    getUserByPubkey: function(pubk) {
        for (let user in this.db) if (this.db[user].pubkey == pubk) return { username: user, object: this.db[user] };
        return null;
    },
    getUserBySecret: function(secr) {
        for (let user in this.db) if (this.db[user].secret == secr) return { username: user, object: this.db[user] };
        return null;
    },
    getUserByName: (user) => user.db[user],
    setUser: function(name, data) {
        let snaps = this.db;
        snaps[name] = data;
        this.db = snaps;
    },
    get db() {
        return JSON.parse(fs.readFileSync(__dirname + "/users.json"));
    },
    set db(val) {
        return fs.writeFileSync(__dirname + "/users.json", JSON.stringify(val, null, "\t"));
    }
}

app.get("/", function(req, res) {
    if (req.cookies.token && user.getUserBySecret(req.cookies.token)) {
        let print_html_usrnm = fs.readFileSync(__dirname + "/secretz.html").toString();
        print_html_usrnm = print_html_usrnm.replace("%username%", encodeURIComponent(user.getUserBySecret(req.cookies.token).username));
        return res.send(print_html_usrnm);
    }
    res.sendFile(__dirname + "/logonpage.html")
});

app.get("/logout", function(req, res) {
    res.clearCookie("token");
    res.redirect("/");
})

app.get("/registerPubKey", function(req, res) {
    res.sendFile(__dirname + "/pubkey_uploader.html");
});

app.post("/registerPubKey", function(req, res) {
    if (!req.body.pubkey) return res.status(400).send("Bad request!");
    if (!req.body.username) return res.status(400).send("Bad request!");
    user.setUser(req.body.username, {
        pubkey: req.body.pubkey,
        secret: crypto.randomBytes(16).toString("hex")
    })
    res.send("OK");
});

app.get("/imagination.js", function(req, res) {
    res.sendFile(__dirname + "/Imagination.js");
});

app.get("/getEncryptedSecret", function(req, res) {
    if (!user.getUserByPubkey(req.query.pubkey)) return res.status(401).send("Invalid public key: unregistered or blocked user?");
    try {
        res.send(crypto.publicEncrypt({
            key: req.query.pubkey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        }, Buffer.from(user.getUserByPubkey(req.query.pubkey).object.secret, "utf-8")).toString("base64"));
    } catch (e) {
        console.error(e);
        res.status(500).send("Something went terribly wrong when encrypting the secret token");
    }
});

app.get("/style.css", function(req, res) {
    res.sendFile(__dirname + "/style.css");
});

app.listen(3000, function() {
    console.log("It took years of preparation to finally do this POC. (HTTP at :3000)");
});
if (fs.existsSync(__dirname + "/key-crt")) {
    console.log("key-crt folder exists, so launching with HTTPS");
    const https = require("https").Server({
        key: fs.readFileSync(__dirname + "/key-crt/localhost.key"),
        cert: fs.readFileSync(__dirname + "/key-crt/localhost.crt"),
    }, app);
    https.listen(3001, function() {
        console.log("HTTPS at :3001 open");
    });
} else console.warn("key-crt does not exist! Use create-crt tool to allow non-localhost access.");