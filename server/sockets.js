module.exports = {
    
    connect: function(io, PORT){
        var rooms = ["room1", "room2", "room3", "admin"];
        var Channels = [{'Channel' : 'channel1', 'group' : 'group1' },
                        {'Channel' : 'channel2', 'group' : 'group1' },
                        {'Channel' : 'channel3', 'group' : 'group1' },]; 
        var users = [{'user' : 'human', 'pword' : 'food', 'powers' : '2'}, 
                     {'user' : 'dog', 'pword' : 'cat', 'powers' : '1'}, 
                     {'user' : 'fish', 'pword' : 'water', 'powers' : '1'}, 
                     {'user' : 'admin', 'pword' : 'admin', 'powers' : '3'}];
        var socketRoom = []; // list holders (socket.id (person), joined room)
        var socketRoomnum = []; 

        io.on('connection', (socket)=>{
            console.log('user connection on port' + 'PORT ' + socket.id);
            var chathis = require('./chatHistory.json');


            socket.on('logindetails', (message) => {
                for(let i = 0; i <users.length; i++){
                    if(message[0] == users[i].user && message[1] == users[i].pword){
                        io.emit("logindetails", users[i].powers);
                    }else{
                        io.emit("logindetails", 0);
                    }
                }
            });


            socket.on('message', (message)=>{
                for (i = 0; i<socketRoom.length; i++){
                    if(socketRoom[i][0] == socket.id){
                        io.to(socketRoom[i][1]).emit('message', message);
                    }
                }
                
            });


            //giving a user a list of all rooms used
            socket.on('roomlist',(m)=>{
                io.emit('roomlist', JSON.stringify(rooms));
            });
            // joining a room, checking if the room is real, joining it and then adding count
            socket.on("joinRoom", (room)=>{
                if(rooms.includes(room)){
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
                }
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
            

        });


    }
}