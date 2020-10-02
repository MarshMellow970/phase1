module.exports = {
    insertfunc:function(colName, data, callbackfunction){
        const MongoClient = require('mongodb').MongoClient;
        const url = 'mongodb://localhost:27017';
        const client = new MongoClient(url);
        const dbName = 'Phase2';

        // build chathistory

        //var colName = 'chathistory';
            var chatHistory = require('../chatHistory.json');
            var thisChatHistory = chatHistory;
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("chathis making")
                const db = client.db(dbName);
                var collection = db.collection(colName);
                collection.insertOne(data, function(err, result){
                    console.log(result);
                    callbackfunction();
                })
            });
    }
}