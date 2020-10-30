var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(error, db) {
  if (error) throw error;
  var dbo = db.db("shoppingdb");
  dbo.collection("cart").drop(function(error, delOK) {
    if (error) throw error;
    if (delOK) console.log("Collection deleted");
    db.close();
  });
});
