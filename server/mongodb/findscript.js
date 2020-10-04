module.exports = {
    findDocuments = function(collectionw, queryJSON, callback){
        const MongoClient = require('mongodb').MongoClient;
            const url = 'mongodb://localhost:27017';
            const client = new MongoClient(url);
            const dbName = 'Phase2';
        
            client.connect(function(err){
                console.log("connection successful to server");
                console.log("search", queryJSON)
                const db = client.db(dbName);
                var collection = db.collection(collectionw);
                collection.find(queryJSON, function(err, result){
                    console.log(result);
                    callback();
                })
            });
    }
}