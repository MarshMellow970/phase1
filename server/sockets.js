const { group } = require('console');
const updater = require('./mongodb/insertdata.js'); 
const fetcher = require('./mongodb/findscript.js');

module.exports = {
    
    connect: function(io, PORT){

        const MongoClient = require('mongodb').MongoClient;
            const url = 'mongodb://localhost:27017';
            const client = new MongoClient(url);
            const dbName = 'Phase2';

        var groupin = require('./groups.json');
        var groups = groupin;

        var roomin = require('./rooms.json');
        var rooms = roomin;

        var groups = require('./groups.json');
        var grouplist = groups;

        var test = require('./users.json');
        var users = test;

        // array for holding all messages and saves to json file 
        var chatHistory = require('./chatHistory.json');
        var thisChatHistory = chatHistory;

        var socketRoom = []; // list holders (socket.id (person), joined room)
        var socketRoomnum = []; 
        var fs = require('fs');
       
        io.on('connection', (socket)=>{
            console.log('user connection on port' + 'PORT ' + socket.id);
            
            //update to mongo only -----------------------------------
            socket.on('logindetails', (message) => {
                //mongodb
                var queryJSON = { "user": message[0], "pword": message[1]};
                client.connect(function(err){
                    console.log("connection successful to server");
                    console.log("search", queryJSON)
                    const db = client.db(dbName);
                    var collection = db.collection("users");
                    collection.find(queryJSON).toArray(function(err, result){
                        console.log("collection", result);
                        if(result.length > 0){
                            io.emit("logindetails", result[0].powers);
                        }else{
                            io.emit("logindetails", 0);
                        }
                    });
                });
            });

            //update to mongo only -----------------------------------
            socket.on('history', (m)=>{
                let chathis = [];
                let room = "";
                for (let i = 0; i<socketRoom.length; i++){
                    if(socketRoom[i][0] == socket.id){
                        room = socketRoom[i][1];
                    }
                }
                for (let j = 0; j < chatHistory.length; j++){
                    if(chatHistory[j].room == room){
                        chathis.push(chatHistory[j].message);
                    }
                }
                io.emit('history', chathis); 
            });

            //update to mongo only -----------------------------------
            socket.on('message', (message)=>{
                for (i = 0; i<socketRoom.length; i++){
                    if(socketRoom[i][0] == socket.id){
                        console.log("before");
                        console.log(thisChatHistory); 
                        var doc = {'message' : message, 'room' :socketRoom[i][1]};
                        updater.insertfunc("chathistory", doc, function(){
                            thisChatHistory.push(doc); 
                            fs.writeFile('chatHistory.json', JSON.stringify(thisChatHistory), 'utf8', callback=>{console.log("message added")}); 
                            
                        });
                        io.to(socketRoom[i][1]).emit('message', message);

                    }
                }
                
            });


            //giving a user a list of all rooms used checks if the room has the correct user listing in it
            //additonally added groups which limits again what users have access to what groups 

            //update to mongo only -----------------------------------
            socket.on('roomlist',(m)=>{
                var packet = []; 
                var grouprooms = [];
                //create room list based on group
                for(j = 0; j<grouplist.length; j++){
                    if(grouplist[j].name == m[0]){
                        grouprooms = grouplist[j].channels;
                    }
                }
                // reduce rooms down into groups
                for(let i = 0; i<rooms.length; i++){
                    if(grouprooms.includes(rooms[i].name)){
                        if(rooms[i].users.includes(m[1])){
                            packet.push(rooms[i].name);
                        }
                    }
                }
                io.emit('roomlist', JSON.stringify(packet));
            });
            //update to mongo only -----------------------------------
            socket.on('channellist', (m)=>{

                // mongodb 
                var queryJSON = {users :{$in: [m]}};
                const db = client.db(dbName);
                client.connect(function(err){
                    console.log("connection successful to server");
                    console.log("search", queryJSON)
                    var collection = db.collection("groups");
                    collection.find(queryJSON).toArray(function(err, result){
                        console.log("collection", result);
                        if(result.length > 0){
                            //io.emit("channellist", result[0].powers);
                        }
                    });
                });
                var channels = [];
                for(let i = 0; i<grouplist.length; i++){
                    if(grouplist[i].users.includes(m)){
                        channels.push(grouplist[i].name);
                    }
                    //channels.push(grouplist[i].name);
                }
                io.emit('channellist', channels)
            });

            // joining a room, checking if the room is real, joining it and then adding count
            socket.on("joinRoom", (room)=>{
                var isin = false;
                for(let i = 0; i<rooms.length; i++){
                    if(rooms[i].name == room){
                        isin = true;
                    }
                }
                if(isin){
                    socket.join(room,()=>{
                        var inroomSocketarray = false;

                        for(i=0; i<socketRoom.length;i++){
                            if(socketRoom[i][0] == socket.id){
                                socketRoom[i][1] = room;
                                inroom = true;
                            }
                        }
                        if(inroomSocketarray == false){
                            socketRoom.push([socket.id, room]);
                            var hasroomnum = false; 
                            for(let j = 0; j<socketRoomnum.length; j++){
                                if(socketRoomnum[j][0] == room){
                                    socketRoomnum[j][1] = socketRoomnum[j][1] + 1;
                                    hasroomnum = true; 
                                }
                            }
                            if(hasroomnum == false){
                                socketRoomnum.push([room, 1]);
                            }
                        }
                    });
                    return io.in(room).emit("joined", room);
                }
            });
            
            //leaving room doing the same as above. 
            socket.on("leaveRoom", (room)=>{
                for(let i = 0; i<socketRoom.length; i++){
                    if(socketRoom[i][0]== socket.id){
                        socketRoom.splice(i,1);
                        socket.leave(room);

                    }
                }
                for(let j=0; j<socketRoomnum.length; j++){
                    if(socketRoomnum[j][0] == socket.id){
                        socketRoomnum[j][1] = socketRoomnum[j][1] - 1;
                        if(socketRoomnum[j][1] == 0){
                            socketRoomnum.splice(j,1);
                        }
                    }
                }
            })


            //----------------------Super Admin -----------------------------
            //update to mongo only -----------------------------------
            socket.on("UserMKR", (packet)=>{
                var doc = {'user' : packet[0], 'pword' : packet[1], 'powers' : packet[2]};
                try{
                    users.push({'user' : packet[0], 'pword' : packet[1], 'powers' : packet[2]});
                }
                catch{
                    socket.emit('Success', "Fail");
                    return; 
                }

                updater.insertfunc('chathistory', doc, function(){
                    fs.writeFile('users.json', JSON.stringify(users), 'utf8', callback=>{console.log("user added")}); 
                    console.log(users);
                });
            });

            socket.on("UserSUPERSet", (username)=>{
                for(let i =0; i<users.length; i++){
                    if(users[i].user == username){
                        users[i].powers = "3";
                    }
                }
                console.log(users);
            });

            socket.on("UserAdminSet", (username)=>{
                for(let i =0; i<users.length; i++){
                    if(users[i].user == username){
                        users[i].powers = "2";
                    }
                }
                console.log(users);
            });

            //deleting a user
            socket.on("UserDLT", (username)=>{
                for(let i =0; i<users.length; i++){
                    if(users[i].user == username){
                        users.splice(i,1);
                    }
                }
                console.log(users);
            });


            //----------------------Group Admin -----------------------------
            socket.on("SpawnGroup", (name)=>{
                try{
                    
                    let test = {"name" : name, "users" : ["admin"]};
                    updater.insertfunc('chathistory', doc, function(){
                        rooms.push(test);
                    
                        fs.writeFile('rooms.json', JSON.stringify(rooms), 'utf8', callback=>{console.log("room added")});
                    }); 
                }
                catch{
                    console.log("bad");
                }
            });

            socket.on("UserRoomLink", (packet) =>{
                try{
                    var lock; 
                    for(let i = 0; i<rooms.length; i++){
                        if(rooms[i].name == packet[0]){
                            lock = i;
                        }
                    }
                    // check if user is already in 
                    if(rooms[lock].users.includes(packet[1])){
                        console.log("room add error user already in room");
                        return; 
                        
                    }
                    rooms[lock].users.push(packet[1]); 
                    fs.writeFile('rooms.json', JSON.stringify(rooms), callback=>{console.log("userlink made")});
                }
                catch{
                    console.log("bad");
                }
            });

            socket.on("removeUserRoomLink", (packet) =>{
                console.log("user removal");
                try{
                    var lock; 
                    for(let i = 0; i<rooms.length; i++){
                        if(rooms[i].name == packet[0]){
                            lock = i;
                        }
                    }
                    
                    for(let j = 0; j< rooms[lock].users.length; j++){
                        console.log(rooms[lock].users[j]);
                        if(rooms[lock].users[j] == packet[1]){
                            rooms[lock].users.splice(j,1);
                        }
                    }
                    
                    fs.writeFile('rooms.json', JSON.stringify(rooms), callback=>{console.log(rooms)});
                }
                catch{
                    console.log("bad");
                }
            });
            //creates a group  
            socket.on("Spawnchannel", (name)=>{
                try{
                    let test = {"name" : name, "channels" : [], "users" : ["admin"]};
                    rooms.push(test);
                    fs.writeFile('rooms.json', JSON.stringify(rooms), 'utf8', callback=>{console.log("room added")});
                    
                }
                catch{
                    console.log("bad");
                }
            });
            // functions for premissions for group access 
            socket.on("UserGroupLink", (packet) =>{
                try{
                    var lock; 
                    for(let i = 0; i<rooms.length; i++){
                        if(grouplist[i].name == packet[0]){
                            lock = i;
                        }
                    }
                    // check if user is already in 
                    if(grouplist[lock].users.includes(packet[1])){
                        console.log("room add error user already in room");
                        return; 
                        
                    }
                    grouplist[lock].users.push(packet[1]); 
                    fs.writeFile('groups.json', JSON.stringify(rooms), callback=>{console.log("userlink made")});
                }
                catch{
                    console.log("bad");
                }
            });

            socket.on("removeUserGroupLink", (packet) =>{
                console.log("user removal");
                try{
                    var lock; 
                    for(let i = 0; i<grouplist.length; i++){
                        if(grouplist[i].name == packet[0]){
                            lock = i;
                        }
                    }
                    
                    for(let j = 0; j< grouplist[lock].users.length; j++){
                        console.log(grouplist[lock].users[j]);
                        if(grouplist[lock].users[j] == packet[1]){
                            grouplist[lock].users.splice(j,1);
                        }
                    }
                    
                    fs.writeFile('groups.json', JSON.stringify(rooms), callback=>{console.log(rooms)});
                }
                catch{
                    console.log("bad");
                }
            });
            

        });


    }
}