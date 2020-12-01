var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
//const url = "mongodb+srv://Pontus:0PS98cL5U1Ud0p5i@cluster0.26pqd.gcp.mongodb.net/shoppingdb?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    var dbo = db.db("shoppingdb");
    dbo.createCollection("images", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
    console.log("Images collection created");
});
