const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var port = process.env.PORT || 8072;
app.use(express.urlencoded({ extended: false }))
const cors = require('cors')//New for microservice
const MongoClient = require('mongodb').MongoClient;
const mongourl = "mongodb+srv://CCA-VIVEK-CLOUD:vivek8080@cca-vivek-cloud.djoox.mongodb.net/cca-authservice?retryWrites=true&w=majority"
const dbClient = new MongoClient(mongourl, { useNewUrlParser: true, useUnifiedTopology: true });
const server = require('http').createServer(app);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors());
app.listen(port);
app.use(express.static(__dirname + '/public'));
console.log("useraccounnt-microservice started on port: " + port);

dbClient.connect(err => {
    if (err) throw err;
    console.log("Connected to MongoDB cluster");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/signuptest.html');
});


app.post("/signup", (req, res) => {
    const db = dbClient.db();
    console.log(req.body);
    console.log(req.body);
    const { username, password, fullname, email } = req.body;
    db.collection("user").findOne({ username: username }, (err, user) => {
        if (user) {
            res.status(400).json({ success: false, message: "User already exist - Please login" });
            return;
        } else {
            let newUser = { username: username, password: password, fullname: fullname, email: email };
            db.collection("user").insertOne(newUser, (err, result) => {
                if (err) {
                    res.status(500).json({ success: false, message: "Signup failed!" });
                } else {
                    res.status(200).json({ success: true, message: "Successfully Signed up." })
                }
            });
        }
    });
});


app.post("/login", (req, res) => {
    const db = dbClient.db();
    console.log(req.body);
    const { username, password } = req.body;
    db.collection("user").findOne({ username: username, password: password}, (err, user) => {
        if (err || !user) {
            console.log("database check -----> not found")
            res.status(400).json({ success: false, message: "User does not exist!"});
        }
        if (user && user.username == username) {
            let account = {
                username : user.username,
                fullname : user.fullname || user.username,
                email : user.email,
                avatar : 'https://i.pravatar.cc/150?u='+username 
            };
            console.log("database check -----> found"+user.fullname)
            res.status(200).json({ success: true ,message: "Successfully loggedIn.", account : account })   
            
        }
    });
});