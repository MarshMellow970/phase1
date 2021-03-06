module.exports = {
    build:function(){
        const MongoClient = require('mongodb').MongoClient;
        const url = 'mongodb://localhost:27017';
        const client = new MongoClient(url);
        const dbName = 'Phase2';

        // build chathistory
        var colName = 'chathistory';
        var chatHistory = require('../chatHistory.json');
        var thisChatHistory = chatHistory;
        client.connect(function(err){
            console.log("connection successful to server");
            console.log("chathis making")
            const db = client.db(dbName);
            var collection = db.collection(colName);
            collection.insertMany(thisChatHistory, function(err, result){
                console.log(thisChatHistory);
                groupsfunc();
            })
        });
        // build groups
        var groupsfunc = function(){
            colName = 'groups';
            var groups = require('../groups.json');
            var grouplist = groups;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("group making")
                const db = client.db(dbName);
                var collection = db.collection(colName);
                collection.insertMany(grouplist, function(err, result){
                    console.log(grouplist);
                    roomsfunc();
                })
            });
        }
        // build rooms
        var roomsfunc = function(){
            colName = 'rooms';
            var roomin = require('../rooms.json');
            var rooms = roomin;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("room making")
                const db = client.db(dbName);
                var collection = db.collection(colName);
                collection.insertMany(rooms, function(err, result){
                    console.log(rooms);
                    usersfunc();
                })
            });
        }
        // build users 
        var usersfunc = function(){
            colName = 'users';
            var test = require('../users.json');
            var users = test;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("users making")
                const db = client.db(dbName);
                var collection = db.collection(colName);
                collection.insertMany(users, function(err, result){
                    console.log(users);

                })
            });
        }
    }
}