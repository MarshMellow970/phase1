const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'Phase2';

// build chathistory
const colName = 'chathistory';
var chatHistory = require('./chatHistory.json');
var thisChatHistory = chatHistory;
client.connect(function(err){
    console.log("connection successful to server");
    console.log("chathis making")
    const db = client.db(dbName);
    const collection = db.collection(colName);
    collection.insertMany(thisChatHistory, function(err, result){
        console.log(thisChatHistory);
    })
});
// build groups


// build rooms
// build users 