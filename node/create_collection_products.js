var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("shoppingdb");
    dbo.createCollection("products", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
    var myobj = [
        { name: 'apple', category: 'fruit' },
        { name: 'banana', category: 'fruit' },
        { name: 'pear', category: 'fruit' }
    ];
    dbo.collection("products").insertMany(myobj, function(err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
    });
});
