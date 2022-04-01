const express = require('express')
const superagent = require('superagent');
let chatdb = require("./chatdb");
let chatbot = require("./chatbot");
const app = express()
const axios = require('axios');
var port = process.env.PORT || 8081;
app.use(express.static('static'))
const cors = require('cors')
app.use(cors())
const server = require('http').createServer(app);
const io = require('socket.io')(server);
//app.use(express.urlencoded({extended: false}))
server.listen(port, () => 
    console.log('HTTP server with express js listening to port'+port )
)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/chatclient.html');
})

function userlist(event){
    var sockets = io.sockets.sockets;
                let onlineUsers = new Map();
                 let account = {
                    username : "chatbot",
                    fullname : "chatbot",
                    email : "chatbot@us.com",
                    avatar : 'https://image.flaticon.com/icons/png/512/740/740110.png'
                };
                onlineUsers.set("chatbot",account)
                for (var id in sockets){
                const socketclient = sockets[id];
                if(socketclient && socketclient.authenticated && socketclient.profile){
                onlineUsers.set(socketclient.username,socketclient.profile);
                }
                }
                
                let onlineUsersJSON = [];
                onlineUsers.forEach((value,key)=>{
                onlineUsersJSON.push(value);
                });
                if(event == "login"){
                    for (var id in sockets){
                const socketclient = sockets[id];
                if(socketclient && socketclient.authenticated && socketclient.profile){
                socketclient.emit("onlineusers", onlineUsersJSON)
                }
            }
                }
                if(event == "disconnect"){
                    for (var id in sockets){
                const socketclient = sockets[id];
                if(socketclient && socketclient.authenticated && socketclient.profile){
                socketclient.emit("updateusers", onlineUsersJSON)
                }
            }
                }
                
}
                

io.on('connection', (socketclient) => {
    console.log('A new client is connected!');
    var onlineClients = Object.keys(io.sockets.sockets).length;
    console.log("the online clients count is "+Object.keys(io.sockets.sockets).length);
    
    socketclient.on("message", (data) => {
        if(socketclient.authenticated == true)
        {
            console.log('Data from client: '+data);
            BroadcastAuthenticatedClients("message", `${socketclient.username} says: ${data}`);

        }
        
    
    });
    socketclient.on("loginuser", (username, password) => {

        let postData = {
            username: username,
            password: password
        }

        console.log(postData);
        axios.post("https://cca-sprintauth.herokuapp.com/login", postData)
            .then(function (response) {
                console.log("success");
                socketclient.authenticated = true;
                socketclient.username = postData.username;
                let user = response.data["account"];
                socketclient.profile = user;
                console.log("the user data is"+user.fullname);
                //userlist(user)
                socketclient.emit("login",user);
                userlist("login")
                var welcomemessage = `${socketclient.username} is connected! : Number of connected clients : ${onlineClients}`
                console.log(welcomemessage);
                io.emit("online", welcomemessage);
                

            })
            .catch(function (response) {
                console.log(response.data);
                socketclient.emit("login-error", username);
                
            });

    });

    socketclient.on("create", (fullname, email, username, password) => {
        console.log("Got inside the create");
        let postData = {
            username: username,
            password: password,
            fullname: fullname,
            email: email
        }

        console.log(postData);
        axios.post("https://cca-sprintauth.herokuapp.com/signup", postData)
            .then(function (response) {
                console.log("Success");
                socketclient.authenticated = true;
                socketclient.username = postData.username;
                io.account = postData;
                socketclient.emit("signup");
            })
            .catch(function (response) {
                console.log(response.data);
                io.emit("signup-error", "User already exist please login");
            });

    });

    socketclient.on("typing", () => {
        if(socketclient.authenticated == true)
        {
            console.log("someone is typing");
            io.emit("typing", `${socketclient.username} is typing......`);
        }
        
    });

    
        socketclient.on("privatechat", (receiver,message,sender) => {    
        var sockets = io.sockets.sockets;
        for (var id in sockets){
        let socketclient = sockets[id];
        if (receiver == "chatbot"){
            console.log("chatbot on !!!!!!!!")
            let privatechat = {sender:sender,receiver:receiver,message:message}
            chatdb.storePrivateMessage(privatechat)
            if (message.includes("weight") && message.includes("height")){
                    socketclient.emit("privatechat",receiver,"LOADING!!!");
            }
            if (message.includes("weight") && !message.includes("height")){
                    socketclient.emit("privatechat",receiver,"LOADING!!!");
            }
            chatbot.chatbot_auto(sender,message,(data)=> {  
                if(data){
                    socketclient.emit("privatechat",receiver,data);
                    privatechat = {sender:receiver,receiver:sender,message:data}
                    chatdb.storePrivateMessage(privatechat)
                }
                      
            });
        }
        if(socketclient && socketclient.authenticated && socketclient.username == receiver){
                let privatechat = {sender:sender,receiver:receiver,message:message}
                chatdb.storePrivateMessage(privatechat)
                socketclient.emit("privatechat",sender,message);           
        }
        }
    });
        socketclient.on("chathistory", (receiver,sender) => {    
        //console.log("inside chat history",sender); 
        //console.log("inside chat history",receiver)           
        var sockets = io.sockets.sockets;
        for (var id in sockets){
        let socketclient = sockets[id];
        if(socketclient && socketclient.authenticated && socketclient.username == sender) {
            console.log("load private message");
            chatdb.loadPrivateMessage(sender,receiver,(message)=> {
                if(message){
                    //console.log("the callback is from index"+JSON.stringify(message));
                    socketclient.emit("chathistory",receiver,message);
                } 
            });
        }
        }
    });

    
    socketclient.on('disconnect', () => {
        var onlineClients = Object.keys(io.sockets.sockets).length;
        var byemessage = `${socketclient.username} is disconnected: Number of connected clients ${onlineClients}`
        console.log(byemessage);
        io.emit("online",byemessage);
        userlist("disconnect")
    })

    });   

function BroadcastAuthenticatedClients(event,message){
    var sockets = io.sockets.sockets;
    for (var id in sockets){
        const socketclient = sockets[id];
        if(socketclient&&socketclient.authenticated){
            socketclient.emit(event,message)
        }
    }
}



