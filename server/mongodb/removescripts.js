module.exports = {
    remove:function(){
        const MongoClient = require('mongodb').MongoClient;
        const url = 'mongodb://localhost:27017';
        const client = new MongoClient(url);
        const dbName = 'Phase2';

        // build chathistory
        var colName = 'chathistory';
        var chatHistory = require('./chatHistory.json');
        var thisChatHistory = chatHistory;
        client.connect(function(err){
            console.log("connection successful to server");
            console.log("chathis making")
            const db = client.db(dbName);
            var collection = db.collection(colName);
            collection.drop(function(err, result){
                console.log("droped");
                groupsdel();
            })
        });
        // build groups
        var groupsdel = function(){
            colName = 'groups';
            var groups = require('./groups.json');
            var grouplist = groups;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis making")
                const db = client.db(dbName);
                collection = db.collection(colName);
                collection.drop(function(err, result){
                    console.log("droped");
                    coldel();
                })
            });
        }
        // build rooms
        var coldel = function(){
            colName = 'rooms';
            var roomin = require('./rooms.json');
            var rooms = roomin;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis making")
                const db = client.db(dbName);
                collection = db.collection(colName);
                collection.drop(function(err, result){
                    console.log("droped");
                    usersdel();
                })
            });
        }
        // build users 
        var usersdel = function(){
            colName = 'users';
            var test = require('./users.json');
            var users = test;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis making")
                const db = client.db(dbName);
                collection = db.collection(colName);
                collection.drop(function(err, result){
                    console.log("droped");
                })
            });
        }
    }
}