const { group } = require('console');

module.exports = {
    
    connect: function(io, PORT){
        var roomin = require('./rooms.json');
        var rooms = roomin;
        var Channels = [{'Channel' : 'channel1', 'group' : 'group1' },
                        {'Channel' : 'channel2', 'group' : 'group1' },
                        {'Channel' : 'channel3', 'group' : 'group1' },]; 
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
            

            socket.on('logindetails', (message) => {
                for(let i = 0; i <users.length; i++){
                    if(message[0] == users[i].user && message[1] == users[i].pword){
                        io.emit("logindetails", users[i].powers);
                    }else{
                        io.emit("logindetails", 0);
                    }
                }
            });

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


            socket.on('message', (message)=>{
                for (i = 0; i<socketRoom.length; i++){
                    if(socketRoom[i][0] == socket.id){
                        thisChatHistory.push({'message' : message, 'room' :socketRoom[i][1]}); 
                        fs.writeFile('chatHistory.json', JSON.stringify(thisChatHistory), 'utf8', callback=>{console.log("message added")}); 
                        io.to(socketRoom[i][1]).emit('message', message);
                    }
                }
                
            });


            //giving a user a list of all rooms used
            socket.on('roomlist',(m)=>{
                var packet = []; 
                for(let i = 0; i<rooms.length; i++){
                    if(rooms[i].users.includes(m)){
                        packet.push(rooms[i].name);
                    }
                }
                io.emit('roomlist', JSON.stringify(packet));
            });

            socket.on('channellist', (m)=>{
                var channels = [];
                for(let i = 0; i<Channels.length; i++){
                    if(Channels[i].group == m){
                        JSON.stringify(channels.push(Channels[i].Channel));
                    }
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
            socket.on("UserMKR", (packet)=>{
                try{
                    users.push({'user' : packet[0], 'pword' : packet[1], 'powers' : packet[2]});
                }
                catch{
                    socket.emit('Success', "Fail");
                    return; 
                }
                fs.writeFile('users.json', JSON.stringify(users), 'utf8', callback=>{console.log("user added")}); 
                console.log(users);
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
                    rooms.push(test);
                    fs.writeFile('rooms.json', JSON.stringify(rooms), 'utf8', callback=>{console.log("room added")});
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
            

        });


    }
}