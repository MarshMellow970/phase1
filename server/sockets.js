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
                    const db = client.db(dbName);
                    var collection = db.collection("users");
                    collection.find(queryJSON).toArray(function(err, result){
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
                var queryJSON = {users :{$in: [m]}};
                const db = client.db(dbName);
                client.connect(function(err){
                    console.log("connection successful to server");
                    console.log("search", queryJSON)
                    var collection = db.collection("groups");
                    collection.find(queryJSON).toArray(function(err, result){
                        var channels = [];
                        for(var i = 0; i < result.length; i++){
                            channels.push(result[i].name);
                        }


                        if(result.length > 0){
                            io.emit("channellist", channels);
                        }
                    });
                });
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
                        var channels = [];
                        for(var i = 0; i < result.length; i++){
                            channels.push(result[i].name);
                        }
                        if(result.length > 0){
                            io.emit("channellist", channels);
                        }
                    });
                });
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
                var queryJSON = { "user": packet[0]};
                var doc = {'user' : packet[0], 'pword' : packet[1], 'powers' : packet[2]};
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("users");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            collection.insertOne(doc, function(err, result){
                                socket.emit('Success', "added user");
                            });
                        }else{
                            socket.emit('Success', "failed");
                        }
                    });
                });
            });               
                

            socket.on("UserSUPERSet", (username)=>{
                var queryJSON = { "user": username};
                var updateJSON = {"powers": 3};
                client.connect(function(err){
                    const db = client.db(dbName);
                    var collection = db.collection("users");
                    collection.find(queryJSON, {$set: updateJSON}, function(err, result){
                        socket.emit("UserSUPERSet", "compeleted")
                    });
                });
            });

            socket.on("UserAdminSet", (username)=>{
                var queryJSON = { "user": username};
                var updateJSON = {"powers": 2};
                client.connect(function(err){
                    const db = client.db(dbName);
                    var collection = db.collection("users");
                    collection.find(queryJSON, {$set: updateJSON}, function(err, result){
                        socket.emit("UserSUPERSet", "compeleted")
                    });
                });
            });

            //deleting a user
            socket.on("UserDLT", (username)=>{
                var deltJSON = { "user": username};
                client.connect(function(err){
                    const db = client.db(dbName);
                    var collection = db.collection("users");
                    collection.deleteOne(deltJSON, function(err, result){
                        socket.emit("UserDLT", "compeleted")
                    });
                });
            });


            //----------------------Group Admin -----------------------------
            socket.on("SpawnGroup", (name)=>{
                let doc = {"name" : name, "users" : ["admin"]};
                let queryJSON = {"name": name};
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("groups");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            collection.insertOne(doc, function(err, result){
                                socket.emit('SpawnGroup', "added group");
                            });
                        }else{
                            socket.emit('SpawnGroup', "failed");
                        }
                    });
                });
            });

            socket.on("UserRoomLink", (packet) =>{
                let queryJSON = {"name": packet[0]};
                
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("rooms");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            socket.emit("userRoomLink", 'failed');
                        }else{
                            //add user too room 
                            let update = result[0].users;
                            update.push[packet[1]];
                            let updateJSON = {users: update};
                            collection.updateOne(queryJSON, {$set:updateJSON}, function(err, result){
                                socket.emit("userRoomLink", 'success'); 
                            }) 
                        }
                    });
                });
            });

            socket.on("removeUserRoomLink", (packet) =>{
                let queryJSON = {"name": packet[0], users:{$in:[packet[1]]} };
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("rooms");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            socket.emit("userRoomLink", 'failed');
                        }else{
                            //add user too room 
                            collection.deleteOne(queryJSON, function(err, result){
                                socket.emit("userRoomLink", 'success'); 
                            }) 
                        }
                    });
                });
            });

            //creates a group  
            socket.on("Spawnchannel", (name)=>{
                let doc = {"name" : name, "channels" : [], "users" : ["admin"]};
                let queryJSON = {"name": name};
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("rooms");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            collection.insertOne(doc, function(err, result){
                                socket.emit('Spawnchannel', "added channel");
                            });
                        }else{
                            socket.emit('Spawnchannel', "failed");
                        }
                    });
                });
            });

            // functions for premissions for group access 
            socket.on("UserGroupLink", (packet) =>{
                let queryJSON = {"name": packet[0]};
                
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("groups");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            socket.emit("userRoomLink", 'failed');
                        }else{
                            //add user too room 
                            let update = result[0].users;
                            update.push[packet[1]];
                            let updateJSON = {users: update};
                            collection.updateOne(queryJSON, {$set:updateJSON}, function(err, result){
                                socket.emit("userRoomLink", 'success'); 
                            }) 
                        }
                    });
                });
            });

            socket.on("removeUserGroupLink", (packet) =>{
                let queryJSON = {"name": packet[0], users:{$in:[packet[1]]} };
                const db = client.db(dbName);
                //checks for user name
                client.connect(function(err){
                    var collection = db.collection("groups");
                    collection.findOne(queryJSON).toArray(function(err, result){
                        if(result.length == 0){
                            socket.emit("userRoomLink", 'failed');
                        }else{
                            //add user too room 
                            collection.deleteOne(queryJSON, function(err, result){
                                socket.emit("userRoomLink", 'success'); 
                            }) 
                        }
                    });
                });
            });
            

        });


    }
}