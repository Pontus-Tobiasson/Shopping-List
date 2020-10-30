var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(error, db) {
    if (error) throw error;
    var dbo = db.db("shoppingdb");
    dbo.createCollection("cart", function(error, result) {
        if (error) throw error;
        console.log("Collection created!");
        db.close();
    });
    dbo.collection("products").find({}, { projection: { _id: 1 } }).toArray(function(error, products) {
      if (error) throw error;
      for (let id in products) products[id].value = 0;
      dbo.collection("cart").insertMany(products, function(error, result) {
          if (error) throw error;
          console.log("Number of documents inserted: " + result.insertedCount);
          db.close();
      });
    });
});
