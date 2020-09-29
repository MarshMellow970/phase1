module.exports = {
    find:function(){
        const MongoClient = require('mongodb').MongoClient;
        const url = 'mongodb://localhost:27017';
        const client = new MongoClient(url);
        const dbName = 'Phase2';

        // fetch chathistory
        var colName = 'chathistory';
        var doc; 
        client.connect(function(err){
            console.log("connection successful to server");
            console.log("chathis getting")
            const db = client.db(dbName);
            var collection = db.collection(colName);
            collection.find({}).toArray(function(err, doc){
                console.log(doc);
                fs.writeFile('./chatHistory.json', JSON.stringify(doc), 'utf8', callback=>{console.log("message added")});
                roomsfetch()
            });
            
        });

        //fettch rooms
        var roomsfetch = function(){
            colName = 'rooms';
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis getting")
                const db = client.db(dbName);
                collection = db.collection(colName);
                collection.find({}).toArray(function(err, doc){
                    console.log(doc);
                    fs.writeFile('./rooms.json', JSON.stringify(doc), 'utf8', callback=>{console.log("message added")});
                    groupsfetch();
                });
                
            });
        }
        //fetch groups
        var groupsfetch = function(){
            colName = 'groups';
            var doc; 
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis getting")
                const db = client.db(dbName);
                collection = db.collection(colName);
                collection.find({}).toArray(function(err, doc){
                    console.log(doc);
                    fs.writeFile('./groups.json', JSON.stringify(doc), 'utf8', callback=>{console.log("message added")});
                    usersfetch();
                });
            });
        }
        //fettch users
        var usersfetch = function(){
            colName = 'users';
            var doc; 
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis getting")
                const db = client.db(dbName);
                collection = db.collection(colName);
                collection.find({}).toArray(function(err, doc){
                    console.log(doc);
                    fs.writeFile('./users.json', JSON.stringify(doc), 'utf8', callback=>{console.log("message added")});
                });
                
            });
        }
    }
}