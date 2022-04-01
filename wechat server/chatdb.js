const MongoClient = require('mongodb').MongoClient;
const mongourl = "mongodb+srv://CCA-VIVEK-CLOUD:vivek8080@cca-vivek-cloud.djoox.mongodb.net/cca-sprint3?retryWrites=true&w=majority"
const dbClient = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});

dbClient.connect(err => {
    if (err) throw err;
    console.log("Connected to the Mongo Db cluster"); 
})

module.exports.storePrivateMessage = (privatechat) => {
    const db = dbClient.db();
    console.log("inside private chat chatdb.js"+privatechat.sender);
    console.log("inside private chat chatdb.js"+privatechat.receiver);
    console.log("inside private chat chatdb.js"+privatechat.message);
    if (!privatechat.sender || !privatechat.receiver){
        console.log('SENDER/RECEIVER INVALID chat db');
    }
    else{
        let d = new Date();
        console.log("the date is"+d);
                
        let chatdata = {sender:privatechat.sender,receiver:privatechat.receiver,message:privatechat.message,timestamp:d}        
        db.collection("privatechat").insertOne(chatdata, (err) => {
            if (err){
                console.log("CHAT DB DATA INSERT FAILED");
            }
            console.log("CHAT DB DATA INSERT successful!!!!!!");
        })
    }    
}
module.exports.loadPrivateMessage = (sender,receiver,callback) => {
    const db = dbClient.db();
    console.log("inside load private chat");
    console.log("the sender is "+sender);
    console.log("the receiver is"+receiver);
    if (!sender || !receiver){
        console.log("LOAD PRIVATE CHAT SENDER/RECEIEVER NOT FOUND")
    } 
    db.collection("privatechat").find({
    $or:[ {sender:sender, receiver:receiver},
    {sender:receiver, receiver:sender}]
    }).limit(100).toArray(function (err, message) {
        if(err) throw err;
    callback(message);
    })  
}
