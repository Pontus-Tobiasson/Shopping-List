const MongoClient = require('mongodb').MongoClient;
//const dburl = "mongodb://localhost:27017/";
const dburl = "mongodb://heroku_0hc88pq5:ajv5eoc8L2xCb@ds259577.mlab.com:59577/heroku_0hc88pq5";
const port = process.env.PORT || 8080;
const database = ""; // shoppingdb



//const MongoClient = require('mongodb').MongoClient;
//const dburl = "mongodb+srv://Pontus:0PS98cL5U1Ud0p5i@cluster0.26pqd.gcp.mongodb.net/shoppingdb?retryWrites=true&w=majority";

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

http.createServer(function (request, response) {
    console.log("creating server")
    console.log("Request URL: " + request.url);
    console.log("Request Method: " + request.method);

    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,origin,accept');
    response.setHeader('Access-Control-Allow-Credentials', true);

    // By default accept requests with the OPTIONS method
    if (request.method === "OPTIONS") {
        response.writeHead(202, {'Content-Type': 'text/html'});
        response.end(JSON.stringify("Accepted"));
        return;
    }

    // Handle request to GET data for a single image
    if (request.url.slice(0,8) === "/images/" && request.method === 'GET')
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            let dbo = db.db(database);
            let name = decodeURI(request.url.slice(8));
            if (name.indexOf("?") !== -1) name = name.slice(0, name.indexOf("?"));
            const sharp = require('sharp');
            // Get product id from the product collection
            dbo.collection("products").findOne({ name: name }, function(error, product) {
                if (error) throw error;
                if (product === null) {
                    db.close();
                    console.log("Product doesn't exist");
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end(JSON.stringify("Not Found"));

                } else {
                    dbo.collection("images").findOne({ _id: product._id }, function(error, image) {
                        if (error) throw error;
                        if (image === null) {
                            dbo.collection("images").findOne({ _id: "default" }, function(error, image) {
                                if (error) throw error;
                                db.close();
                                if (image === null) {
                                    console.log("Neither image nor default image exists");
                                    response.writeHead(404, {'Content-Type': 'text/html'});
                                    response.end(JSON.stringify("Not Found"));
                                } else {
                                    sharp(image.image.buffer)
                                    .toFormat('png')
                                    .toBuffer((err, data, info) => {
                                        console.log("Sending default image");
                                        response.writeHead(200, {'Content-Type': 'image/png'});
                                        response.end(data);
                                    });
                                }
                            });
                        } else {
                            db.close();
                            sharp(image.image.buffer)
                            .toFormat('png')
                            .toBuffer((err, data, info) => {
                                console.log("Sending product image");
                                response.writeHead(200, {'Content-Type': 'image/png'});
                                response.end(data);
                            });
                        }
                    });
                }
            });
        });
        return;
    }

    // Handle request to GET product data
    if(request.url === "/products" && request.method === "GET")
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            let dbo = db.db(database);
            // Get product data from MongoDB and then send the data to the client
            dbo.collection("products").find({}, { projection: { _id: 0 } }).toArray(function(error, products) {
                if (error) throw error;
                db.close();
                console.log("Sending product data.");
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(JSON.stringify(products));
            });
        });
        return;
    }

    // Handle request to GET data for a single product
    if (request.url.slice(0,10) === "/products/" && request.method === 'GET')
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            var dbo = db.db(database);
            let name = decodeURI(request.url.slice(10));
            // Get product data from MongoDB and then send the data to the client
            dbo.collection("products").findOne({ name: name }, { projection: { _id: 0 } }, function(error, product) {
                if (error) throw error;
                db.close();
                console.log("Sending product data.");
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(JSON.stringify(product));
            });
        });
        return;
    }

    // Handle request to GET cart data
    if(request.url === "/cart" && request.method === "GET")
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            let dbo = db.db(database);
            // Get products ids from the product collection
            dbo.collection("products").find({}).toArray(function(error, products) {
                if (error) throw error;
                // Get matching values from the cart collection
                dbo.collection("cart").find({}).toArray(function(error, values) {
                    if (error) throw error;
                    // Match the numbers in the cart collection with the product in the product collection
                    let reply = [];
                    for (let value in values)
                    {
                        matchingProduct = products.find(product => product._id.toString() === values[value]._id.toString());
                        reply.push({ name: matchingProduct.name, value: values[value].value});
                    }
                    reply.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                    console.log("Sending cart");
                    db.close();
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(JSON.stringify(reply));
                });
            });
        });
        return;
    }

    // Handle request to GET a single item in the cart
    if(request.url.slice(0,6) === "/cart/" && request.method === "GET")
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            let dbo = db.db(database);
            name = decodeURI(request.url.slice(6));
            // Get product id from the product collection
            dbo.collection("products").findOne({ name: name }, function(error, product) {
                if (error) throw error;
                // Get matching value from the cart collection
                dbo.collection("cart").findOne({ _id: product._id }, function(error, cartProduct) {
                    if (error) throw error;
                    console.log("Sending cart product data");
                    db.close();
                    if (cartProduct === null) {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(JSON.stringify({ name: product.name, value: 0 }));
                    } else {
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(JSON.stringify({ name: product.name, value: cartProduct.value }));
                    }
                });
            });
        });
        return;
    }


    // Handle request to POST a product
    if (request.url === "/products" && request.method === 'POST')
    {
        let product;
        const body = [];
        const formidable = require('formidable');
        const formData = formidable({ multiples: true });
        formData.parse(request, (err, fields, files) => {

            const product = { name: fields.name, category: fields.category, image: files.image };
            // Check that the product data contains both a name and a category
            if(!product.name || !product.category)
            {
                console.log("POST product lacks necessary data")
            } else {

                // First check if the product already exists
                // add the product if it doesn't already exist
                MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
                    if (error) throw error;
                    var dbo = db.db(database);
                    // Check if the product already exists
                    let caseInsensitive = new RegExp("^" + product.name + "$", "i");
                    dbo.collection("products").find({ name: caseInsensitive }).toArray(function(error, products) {
                        if (error) throw error;
                        if(products.length === 0)
                        {
                            // If the product does not exist add it to products
                            dbo.collection("products").insertOne({ name: product.name, category: product.category }, function(error, prod) {
                                if (error) throw error;
                                console.log("Product inserted into products collection");
                                if (product.image === null || product.image === undefined) {
                                    db.close();
                                    response.writeHead(200, {'Content-Type': 'text/html'});
                                    response.end(JSON.stringify("OK"));
                                } else {
                                    const sharp = require('sharp');
                                    sharp(product.image.path)
                                    .toBuffer((err, data, info) => {
                                        let scale = 94 / info.width;
                                        if (info.width < info.height) scale = 94 / info.height;
                                        let width = Math.floor(info.width * scale, 10);
                                        let height = Math.floor(info.height * scale, 10);
                                        let format = "jpeg"
                                        if(info.format === "png") format = "png";
                                        sharp(product.image.path)
                                        .resize(width, height)
                                        .toFormat(format)
                                        .toBuffer((err, image, info) => {
                                            dbo.collection("images").insertOne({ _id: prod.insertedId, image: image }, function(error, img) {
                                                if (error) throw error;
                                                db.close();
                                                console.log("Product inserted into products collection and product image inserted into images collection");
                                                response.writeHead(200, {'Content-Type': 'text/html'});
                                                response.end(JSON.stringify("OK"));
                                                fs.unlink(product.image.path, (err) => {
                                                    if (err) throw err;
                                                    console.log('Successfully deleted temp file');
                                                });
                                            });
                                        });
                                    });
                                }
                            });
                        } else {
                            db.close();
                            console.log("Product already exists");
                            response.writeHead(409, {'Content-Type': 'text/html'});
                            response.end(JSON.stringify("Conflict"));
                        }
                    });
                });
            }
        });

        return;
    }

    // Handle request to DELETE a product
    if (request.url.slice(0,10) === "/products/" && request.method === 'DELETE')
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            var dbo = db.db(database);
            let name = decodeURI(request.url.slice(10));
            dbo.collection("products").find({ name: name }).toArray(function(error, product) {
                if (error) throw error;
                if(product.length !== 0)
                {
                    // Delete the product from the products collection
                    dbo.collection("products").deleteOne({ _id: product[0]._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Product deleted from products collection");
                        // Delete the product from the cart collection
                        dbo.collection("cart").deleteOne({ _id: product[0]._id }, function(error, result) {
                            if (error) throw error;
                            console.log("Product deleted from the cart collection");
                            dbo.collection("images").deleteOne({ _id: product[0]._id }, function(error, result) {
                                if (error) throw error;
                                db.close();
                                console.log("Product deleted from images collection");
                                response.writeHead(200, {'Content-Type': 'text/html'});
                                response.end(JSON.stringify("OK"));
                            });
                        });
                    });
                } else {
                    db.close();
                    console.log("Product doesn't exist");
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end(JSON.stringify("Not Found"));
                }
            });
        });
        return;
    }

    // Handle request to PUT a product
    if (request.url.slice(0,10) === "/products/" && request.method === 'PUT')
    {

        let oldName = decodeURI(request.url.slice(10));;
        const formidable = require('formidable');
        const formData = formidable({ multiples: true });
        formData.parse(request, (err, fields, files) => {
            let product = { name: fields.name, category: fields.category, image: files.image };

            if(!product.name || !product.category)
            {
                console.log("POST product lacks necessary data")
                response.writeHead(400, {'Content-Type': 'text/html'});
                response.end(JSON.stringify("Bad Request"));
            } else {
                product.name = decodeURI(product.name);
                product.category = decodeURI(product.category);

                // First check if the product already exists
                // add the product if it doesn't already exist
                MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
                    if (error) throw error;
                    var dbo = db.db(database);
                    // Check if the product already exists
                    let caseInsensitive = new RegExp("^" + product.name + "$", "i");
                    dbo.collection("products").find({ name: caseInsensitive }).toArray(function(error, products) {
                        if (error) throw error;
                        if(products.length === 0 || oldName.toLowerCase() === product.name.toLowerCase())
                        {
                            dbo.collection("products").find({ name: oldName }).toArray(function(error, prod) {
                                if (error) throw error;
                                if(prod.length !== 0)
                                {
                                    // Update the product in the products collection
                                    let setProduct = { $set: { name: product.name, category: product.category } };
                                    dbo.collection("products").updateOne( prod[0], setProduct, function(error, result) {
                                        if (error) throw error;
                                        if (product.image === null || product.image === undefined) {
                                            db.close();
                                            console.log("Product updated in products collection");
                                            response.writeHead(200, {'Content-Type': 'text/html'});
                                            response.end(JSON.stringify("OK"));
                                        } else {
                                            const sharp = require('sharp');
                                            sharp(product.image.path)
                                            .toBuffer((err, data, info) => {
                                                let scale = 94 / info.width;
                                                if (info.width < info.height) scale = 94 / info.height;
                                                let width = Math.floor(info.width * scale, 10);
                                                let height = Math.floor(info.height * scale, 10);
                                                let format = "jpeg"
                                                if(info.format === "png") format = "png";
                                                sharp(product.image.path)
                                                .resize(width, height)
                                                .toFormat(format)
                                                .toBuffer((err, image, info) => {
                                                    dbo.collection("images").find({ _id: prod[0]._id }).toArray(function(error, img) {
                                                        if (error) throw error;
                                                        if(img.length === 0)
                                                        {
                                                            dbo.collection("images").insertOne({ _id: prod[0]._id, image: image}, function(error, img) {
                                                                if (error) throw error;
                                                                db.close();
                                                                const fs = require('fs');
                                                                fs.unlink(product.image.path, (err) => {
                                                                    if (err) throw err;
                                                                    console.log('Successfully deleted temp file');
                                                                    console.log("Product inserted into products collection and product image inserted into images collection");
                                                                    response.writeHead(200, {'Content-Type': 'text/html'});
                                                                    response.end(JSON.stringify("OK"));
                                                                });
                                                            });
                                                        } else {
                                                            let setImage = { $set: { _id: prod[0]._id, image: image } };
                                                            let setProduct = { $set: { name: product.name, category: product.category } };
                                                            dbo.collection("images").updateOne({ _id: prod[0]._id }, setImage, function(error, img) {
                                                                if (error) throw error;
                                                                db.close();
                                                                const fs = require('fs');
                                                                fs.unlink(product.image.path, (err) => {
                                                                    if (err) throw err;
                                                                    console.log('Successfully deleted temp file');
                                                                    console.log("Product inserted into products collection and product image inserted into images collection");
                                                                    response.writeHead(200, {'Content-Type': 'text/html'});
                                                                    response.end(JSON.stringify("OK"));
                                                                });
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    });
                                } else {
                                    db.close();
                                    console.log("A Product with that name doesn't exist");
                                    response.writeHead(404, {'Content-Type': 'text/html'});
                                    response.end(JSON.stringify("Not Found"));
                                }
                            });
                        } else {
                            db.close();
                            console.log("A product with that name already exists");
                            response.writeHead(409, {'Content-Type': 'text/html'});
                            response.end(JSON.stringify("Conflict"));
                        }
                    });
                });
            }
        });
        return;
    }

    // Handle request to DELETE the entire cart collection
    if (request.url === "/cart" && request.method === 'DELETE')
    {
        MongoClient.connect(dburl, function(error, db) {
            if (error) throw error;
            var dbo = db.db(database);
            dbo.collection("cart").drop(function(error, result) {
                db.close();
                if (error) {
                    console.log(error);
                    textResponse(response, 404 , "Cart was not found"); // Not Found
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end(JSON.stringify("Not Found"));
                }
                if (result) {
                    console.log("Cart deleted");
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(JSON.stringify("OK"));
                }
            });
        });
        return;
    }

    // Handle request to DELETE an a product from the cart collection
    if (request.url.slice(0,6) === "/cart/" && request.method === 'DELETE')
    {
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            if (error) throw error;
            var dbo = db.db(database);
            name = decodeURI(request.url.slice(6));
            // Find the products id
            dbo.collection("products").find({ name: name }).toArray(function(error, product) {
                if (error) throw error;
                if(product.length !== 0)
                {
                    // Remove the product from the cart collection
                    dbo.collection("cart").deleteOne({ _id: product[0]._id }, function(error, result) {
                        if (error) throw error;
                        db.close();
                        console.log("Cart item deleted");
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.end(JSON.stringify("OK"));
                    });
                } else {
                    db.close();
                    console.log("Product doesn't exist");
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end(JSON.stringify("Not Found"));
                }
            });
        });
        return;
    }

    // Handle request to PUT a product value into cart collection
    if (request.url.slice(0,6) === "/cart/" && request.method === 'PUT')
    {
        const body = [];
        request
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
            let newProduct = JSON.parse(Buffer.concat(body).toString());
            let name = decodeURI(request.url.slice(6));
            if (newProduct.name !== null)
            {
                if (newProduct.value < 0 || newProduct.value === null) newProduct.value = 0;
                MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
                    if (error) throw error;
                    let dbo = db.db(database);
                    // Get product id from the products collection
                    dbo.collection("products").findOne({ name: name }, function(error, product) {
                        if (error) throw error;
                        if (product !== null) {
                            dbo.collection("cart").findOne({ _id: product._id }, function(error, item) {
                                if (error) throw error;
                                // If product doesn't exist in the cart table insert it with the given value
                                if (item === null) {
                                    dbo.collection("cart").insertOne({ _id: product._id, value: newProduct.value }, function(error, result) {
                                        if (error) throw error;
                                        db.close();
                                        console.log("Product " + name + " has been added with the value: " + newProduct.value + " in the cart collection");
                                        response.writeHead(200, {'Content-Type': 'text/html'});
                                        response.end(JSON.stringify("OK"));
                                    });
                                    // If product already exists in the cart table update its total value
                                } else {
                                    dbo.collection("cart").updateOne({ _id: product._id }, { $set: { value: newProduct.value } }, function(error, cartProduct) {
                                        if (error) throw error;
                                        db.close();
                                        console.log("Product " + name + " has been updated with the value: " + newProduct.value + " in the cart collection");
                                        response.writeHead(200, {'Content-Type': 'text/html'});
                                        response.end(JSON.stringify("OK"));
                                    });
                                }
                            });
                        } else {
                            db.close();
                            console.log("Product does not exist");
                            textResponse(response, 404, "Product does not exist"); // 404
                            response.writeHead(404, {'Content-Type': 'text/html'});
                            response.end(JSON.stringify("Not Found"));
                        }
                    });
                });
            }
        })
        return;
    }

    // Handle request to PUT product values into cart collection
    if (request.url === "/cart" && request.method === 'PUT')
    {
        let product;
        const body = [];
        request
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
            product = JSON.parse(Buffer.concat(body).toString());
            MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
                if (error) throw error;
                let dbo = db.db(database);
                let reply = [];
                // Get products ids from the products collection
                dbo.collection("products").find().toArray(function(error, products) {
                    if (error) throw error;
                    for (p in product) {
                        let prod = products.find(x => x.name === product[p].name);
                        if(prod) {
                            reply.push({ _id: prod._id, value: product[p].value});
                            console.log(prod._id + " " + product[p].value + " added to cart");
                        } else {
                            console.log("Product " + product[p].name + " doesn't exist");
                        }
                    }
                    // Insert into cart table
                    dbo.collection("cart").find().toArray(function(error, values) {
                        if (error) throw error;
                        for (let p in reply) {
                            // If product already exists in cart update total value
                            let prod = values.find(x => x._id.toString() === reply[p]._id.toString());
                            if(prod) {
                                console.log("Updating value: " + prod._id + " from " + prod.value + " to: " + (prod.value + reply[p].value));
                                dbo.collection("cart").updateOne({ _id: reply[p]._id }, { $set: { value: (prod.value + reply[p].value) } }, function(error, result) {
                                    if (error) throw error;
                                    console.log("Product updated " + reply[p] + " into cart collection");
                                    // Send OK response when the last product is updated
                                    if (parseInt(p, 10) === (reply.length - 1)) {
                                        db.close();
                                        response.writeHead(200, {'Content-Type': 'text/html'});
                                        response.end(JSON.stringify("OK"));
                                    }
                                });
                                // If the product does not already exist in cart then add it
                            } else {
                                console.log("Inserting " + reply[p]._id + " value: " + reply[p].value);
                                dbo.collection("cart").insertOne(reply[p], function(error, result) {
                                    if (error) throw error;
                                    console.log("Product added " + reply[p] + " into cart collection");
                                    // Send OK response when the last product is added
                                    if (parseInt(p, 10) === (reply.length - 1)) {
                                        db.close();
                                        response.writeHead(200, {'Content-Type': 'text/html'});
                                        response.end(JSON.stringify("OK"));
                                    }
                                });
                            }
                        }
                    });
                });
            });
        })
        return;
    }

    if (request.url === "/" && request.method === 'GET')
    {
        fs.readFile(path.join(__dirname, 'build', 'index.html'), (err, content) => {
            if (err) {
                console.error(`Error serving '${path.join(__dirname, 'build', 'index.html')}'`);
                response.writeHead(400);
                response.end(content);
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(content);
            }
        });
        return;
    }

    fs.readFile(path.join(__dirname, 'build', request.url), (err, content) => {
        if (request.url.includes("..")) return;
        if (err) {
            console.error(`Error serving '${path.join(__dirname, 'build', request.url)}'`);
            response.writeHead(400);
            response.end(content);
            return;
        }
        if(path.extname(request.url) === ".html")
        {
            response.writeHead(200, {'Content-Type': 'text/html'});
        } else if (path.extname(request.url) === ".js") {
            response.writeHead(200, {'Content-Type': 'text/javascript'});
        } else if (path.extname(request.url) === ".css") {
            response.writeHead(200, {'Content-Type': 'text/css'});
        } else if (path.extname(request.url) === ".svg") {
            response.writeHead(200, {'Content-Type': 'image/svg+xml'});
        }
        response.end(content);
        return;
    });

    console.log("listening")
}).listen(port);
