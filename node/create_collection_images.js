var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/";
const url = "mongodb+srv://Pontus:0PS98cL5U1Ud0p5i@cluster0.26pqd.gcp.mongodb.net/shoppingdb?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    var dbo = db.db("shoppingdb");
    /*
    dbo.createCollection("images", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
        db.close();
    });
    console.log("Images collection created");
    */

    const sharp = require('sharp');
    sharp("./DefaultImage.jpg")
    .toBuffer((err, data, info) => {
        let scale = 94 / info.width;
        if (info.width < info.height) scale = 94 / info.height;
        let width = Math.floor(info.width * scale, 10);
        let height = Math.floor(info.height * scale, 10);
        sharp("./DefaultImage.jpg")
        .resize(width, height)
        .toBuffer((err, data, info) => {
            dbo.collection("images").insertOne({ _id: "default", image: data }, function(err, res) {
                if (err) throw err;
                console.log("Default image inserted into images collection");
                db.close();
            });
        })
    })
});
