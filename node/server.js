const MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb://localhost:27017/";
//const dburl = "mongodb+srv://"+process.env.MONGODB_USERNAME+":"+process.env.MONGODB_PASSWORD+"@cluster0.26pqd.gcp.mongodb.net/shoppingdb?retryWrites=true&w=majority";
const port = process.env.PORT || 8080;
const database = "shoppingdb";

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let products = [];
let cart = [];
let images = [];

// Initiate products, cart and images with data from MongoDB
MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
    if (error) throw error;
    let dbo = db.db(database);
    dbo.collection("products").find().toArray(function(error, db_products) {
        if (error) throw error;
        products = db_products;
    });
    dbo.collection("cart").find().toArray(function(error, db_cart) {
        if (error) throw error;
        cart = db_cart;
    });
    dbo.collection("images").find().toArray(function(error, db_images) {
        if (error) throw error;
        images = db_images;
    });
});

let delta = [];

// Update local products, cart, images and delta
function update(entry, response, message) {
    if (entry === undefined) {
        console.log("Update was called with nothing");
        return;
    }
    console.log("Updating local collections and delta");
    if (products.find(x => x._id.toString() === entry._id.toString()) === undefined) {
        products.push({ _id: entry._id, name: "", category: ""});
    }
    if (delta.find(x => x._id.toString() === entry._id.toString()) === undefined) delta.push({ _id: entry._id});

    if (entry.name !== undefined) {
        if (entry.name === null) {
            products.splice(indexOfId(products, entry._id), 1);
        } else {
            products.find(x => x._id.toString() === entry._id.toString()).name = entry.name;
        }
        delta.find(x => x._id.toString() === entry._id.toString()).name = entry.name;
    }

    if (entry.category !== undefined) {
        if (entry.category !== null) products.find(x => x._id.toString() === entry._id.toString()).category = entry.category;
        delta.find(x => x._id.toString() === entry._id.toString()).category = entry.category;
    }

    if (entry.value !== undefined) {
        if (cart.find(x => x._id.toString() === entry._id.toString())  === undefined) cart.push({ _id: entry._id, value: 0});
        if (entry.value === null) {
            cart.splice(indexOfId(cart, entry._id), 1);
        } else {
            cart.find(x => x._id.toString() === entry._id.toString()).value = entry.value;
        }
        delta.find(x => x._id.toString() === entry._id.toString()).value = entry.value;
    }

    if (entry.image !== undefined) {
        if (images.find(x => x._id.toString() === entry._id.toString()) === undefined) images.push({ _id: entry._id, image: entry.image });
        if (entry.image === null) {
            images.splice(indexOfId(images, entry._id), 1);
        } else {
            images.find(x => x._id.toString() === entry._id.toString()).image = entry.image;
        }
        delta.find(x => x._id.toString() === entry._id.toString()).image = entry.image;
    }

    if (response !== undefined) response.end(message);
    queueUpdate();
}

let updating = false;
// Queues an update unless an update is already queued
function queueUpdate() {
    if (updating) {
        console.log("Called update but an update is already queued");
        return;
    }
    updating = true;
    let delay = 10000;
    console.log("Starting " + delay/1000 + " second update timer");
    setTimeout(save, delay);
}

// Push changes stored in delta to MongoDB
function save() {
    if (delta.length === 0) {
        console.log("No changes to save")
        updating = false;
        return;
    }
    let snapshot_delta = delta;
    delta = [];
    console.log("Saving changes");

    MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
        const dbo = db.db(database);
        for (let change = 0; change < snapshot_delta.length; change++) {
            if (snapshot_delta[change]._id === undefined) continue;

            if (snapshot_delta[change].name !== undefined && snapshot_delta[change].category !== undefined)
            {
                if (snapshot_delta[change].name === null || snapshot_delta[change].category === null) {
                    dbo.collection("products").deleteOne({ _id: snapshot_delta[change]._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Deleted product: " + snapshot_delta[change]._id);
                    });
                } else {
                    let setProduct = { $set: { name: snapshot_delta[change].name, category: snapshot_delta[change].category } };
                    dbo.collection("products").updateOne({ _id: snapshot_delta[change]._id }, setProduct, function(error, result) {
                        if (error) throw error;
                        console.log("Updated product: " + snapshot_delta[change]._id);
                    });
                }
            }

            if (snapshot_delta[change].value !== undefined) {
                if (snapshot_delta[change].value === null) {
                    dbo.collection("cart").deleteOne({ _id: snapshot_delta[change]._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Deleted cart value: " + snapshot_delta[change]._id);
                    });
                } else {
                    let setValue = { $set: { value: snapshot_delta[change].value } };
                    dbo.collection("cart").updateOne({ _id: snapshot_delta[change]._id }, setValue, { upsert: true }, function(error, result) {
                        if (error) throw error;
                        console.log("Updated cart value: " + snapshot_delta[change]._id);
                    });
                }
            }

            if (snapshot_delta[change].image !== undefined) {
                if (snapshot_delta[change].value === null) {
                    dbo.collection("images").deleteOne({ _id: snapshot_delta[change]._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Deleted image: " + snapshot_delta[change]._id);
                    });
                } else {
                    let setImage = { $set: { image: snapshot_delta[change].image } };
                    dbo.collection("images").updateOne({ _id: snapshot_delta[change]._id }, setImage, { upsert: true }, function(error, result) {
                        if (error) throw error;
                        console.log("Updated image: " + snapshot_delta[change]._id);
                    });
                }
            }

        }
        updating = false;
        if (delta.length !== 0) queueUpdate();
    });
}

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

    // Handle request to GET all product data
    if(request.url === "/products" && request.method === "GET")
    {
        data = []
        for (p in products) if (products[p].name != "") data.push(products[p]);
        console.log("Sending product data.");
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(JSON.stringify(data));
        return;
    }

    // Handle request to GET data for a single product
    if (request.url.slice(0,10) === "/products/" && request.method === 'GET')
    {
        const name = extractName(request.url, "/products/");
        const product = findProduct(name);
        console.log("Sending product data.");
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(JSON.stringify(product));
        return;
    }

    // Handle request to GET all cart data
    if(request.url === "/cart" && request.method === "GET")
    {
        const reply = [];
        for (let item in cart) {
            let matchingProduct = products.find(product => product._id.toString() === cart[item]._id.toString());
            reply.push({ name: matchingProduct.name, value: cart[item].value});
        }
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(JSON.stringify(reply));
        return;
    }

    // Handle request to GET a single item in the cart
    if(request.url.slice(0,6) === "/cart/" && request.method === "GET")
    {
        const name = extractName(request.url, "/cart/");
        const product = findProduct(name);
        if (product === undefined) {
            console.log("Product does not exist");
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end(JSON.stringify("Not Found"));
        } else {
            const item = findCartItem(products.find(x => x.name.toLowerCase() === name)._id.toString());
            console.log("Sending cart product data");
            if (item === undefined) {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(JSON.stringify({ name: product.name, value: 0 }));
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(JSON.stringify({ name: product.name, value: item.value }));
            }
        }
        return;
    }

    // Handle request to GET data for a single image
    if (request.url.slice(0,"/images/".length) === "/images/" && request.method === 'GET')
    {
        const name = extractName(request.url, "/images/");
        const product = findProduct(name);
        if (product === undefined) {
            console.log("Product does not exist");
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end(JSON.stringify("Not Found"));
            return;
        }

        const image = findImage(products.find(x => x.name.toLowerCase() === name.toLowerCase())._id);
        if (image === undefined) {
            fs.readFile("./DefaultImage.jpg", (error, content) => {
                console.log("Sending default image");
                response.writeHead(200, {'Content-Type': 'image/jpeg'});
                response.end(content);
            });
        } else {
            console.log("Sending product image");
            response.writeHead(200, {'Content-Type': 'image/png'});
            response.end(Buffer(image.image.buffer));
        }
        return;
    }

    // Handle request to POST a new product
    if (request.url === "/products" && request.method === 'POST')
    {
        const body = [];
        const formidable = require('formidable');
        const formData = formidable({ multiples: true });
        formData.parse(request, (err, fields, files) => {
            const product = { name: fields.name.toString(), category: fields.category.toString(), image: files.image };
            // Check that the product data contains both a name and a category
            if(!product.name || !product.category)
            {
                console.log("Product lacks necessary data");
                response.writeHead(400, {'Content-Type': 'text/html'});
                response.end(JSON.stringify("Bad Request"));
                return;
            }
            if (products.find(p => p.name.toLowerCase() === product.name.toLowerCase()))
            {
                console.log("Product already exists");
                response.writeHead(409, {'Content-Type': 'text/html'});
                response.end(JSON.stringify("Conflict"));
                return;
            }
            MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
                const dbo = db.db(database);
                p = products.find(p => p.name === "");
                if (p === undefined) {
                    console.log("No pre-generated product ID found");
                    dbo.collection("products").insertOne({ name: "", category: "" }, function(error, result) {
                        if (error) throw error;
                        console.log("Generated product ID " + result.insertedId);
                        if (product.image  === undefined) {
                            update({ _id: result.insertedId, name: product.name, category: product.category });
                        } else {
                            sharp(product.image.path)
                            .toBuffer((err, data, info) => {
                                let scale = 94 / info.width;
                                if (info.width < info.height) scale = 94 / info.height;
                                let width = Math.floor(info.width * scale, 10);
                                let height = Math.floor(info.height * scale, 10);
                                let format = "png"
                                //if(info.format === "jpeg") format = "jpeg";
                                sharp(product.image.path)
                                .resize(width, height)
                                .toFormat(format)
                                .toBuffer((err, image, info) => {
                                    fs.unlink(product.image.path, (err) => {
                                        if (err) throw err;
                                    });
                                    response.writeHead(200, {'Content-Type': 'text/html'});
                                    update({ _id: result.insertedId, name: product.name, category: product.category, image: image }, response, JSON.stringify("OK"));
                                });
                            });
                        }
                    });
                } else {
                    if (product.image === undefined) {
                        update({ _id: products.find(p => p.name === "")._id, name: product.name, category: product.category }, response, JSON.stringify("OK"));
                    } else {
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
                                fs.unlink(product.image.path, (err) => {
                                    if (err) throw err;
                                });
                                response.writeHead(200, {'Content-Type': 'text/html'});
                                update({ _id: products.find(p => p.name === "")._id, name: product.name, category: product.category, image: image }, response, JSON.stringify("OK"));
                            });
                        });
                    }
                }
                console.log("Generating new product ID")
                dbo.collection("products").insertOne({ name: "", category: "" }, function(error, result) {
                    if (error) throw error;
                    db.close();
                    console.log("Generated product ID " + result.insertedId);
                    products.push({ _id: result.insertedId, name: "", category: "" });
                });
            });
        });
        return;
    }

    // Handle request to PUT changes to an existing product
    if (request.url.slice(0,10) === "/products/" && request.method === 'PUT')
    {

        let oldName = extractName(request.url, "/products/");
        if (!products.find(x => x.name.toLowerCase() === oldName.toLowerCase()))
        {
            console.log("A product with the name " + oldName + " does not exist");
            response.writeHead(400, {'Content-Type': 'text/html'});
            response.end(JSON.stringify("Bad Request"));
            return;
        }
        const formidable = require('formidable');
        const formData = formidable({ multiples: true });
        formData.parse(request, (err, fields, files) => {
            let product = { name: fields.name, category: fields.category, image: files.image };
            if(!product.name || !product.category)
            {
                console.log("POST product lacks necessary data")
                response.writeHead(400, {'Content-Type': 'text/html'});
                response.end(JSON.stringify("Bad Request"));
                return;
            } else {
                product.name = decodeURI(product.name);
                product.category = decodeURI(product.category);
            }
            if (products.find(x => x.name.toLowerCase() === product.name.toLowerCase()) && product.name.toLowerCase() !== oldName.toLowerCase())
            {
                console.log("A product with the name " + product.name + " already exists");
                response.writeHead(409, {'Content-Type': 'text/html'});
                response.end(JSON.stringify("Conflict"));
                return;
            }

            if (product.image === undefined) {
                response.writeHead(200, {'Content-Type': 'text/html'});
                update({ _id: findProduct(oldName)._id, name: product.name, category: product.category }, response, JSON.stringify("OK"));
                return;
            } else {
                sharp(product.image.path)
                .toBuffer((err, data, info) => {
                    let scale = 94 / info.width;
                    if (info.width < info.height) scale = 94 / info.height;
                    let width = Math.floor(info.width * scale, 10);
                    let height = Math.floor(info.height * scale, 10);
                    let format = "png"
                    // if(info.format === "jpeg") format = "jpeg";
                    sharp(product.image.path)
                    .resize(width, height)
                    .toFormat(format)
                    .toBuffer((err, image, info) => {
                        fs.unlink(product.image.path, (err) => {
                            if (err) throw err;
                        });
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        update({ _id: findProduct(oldName)._id, name: product.name, category: product.category, image: image }, response, JSON.stringify("OK"));
                        return;
                    });
                });
            }
        });
        return;
    }

    // Handle request to DELETE a product
    if (request.url.slice(0,10) === "/products/" && request.method === 'DELETE')
    {
        const name = extractName(request.url, "/products/");
        if (findProduct(name) !== undefined) {
            console.log("Deleting product " + name);
            response.writeHead(200, {'Content-Type': 'text/html'});
            update({ _id: findProduct(name)._id, name: null, category: null, value: null, image: null }, response, JSON.stringify("OK"));
        } else {
            console.log("Product " + name + " not found");
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end(JSON.stringify("Not Found"));
        }
        return;
    }

    // Handle request to PUT a product value into cart collection
    if (request.url.slice(0,6) === "/cart/" && request.method === 'PUT')
    {
        const body = [];
        request
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
            let product = JSON.parse(Buffer.concat(body).toString());
            let value = product.value;
            if (value < 0) value = 0;
            response.writeHead(200, {'Content-Type': 'text/html'});
            if (products.find(x => x.name.toLowerCase() === product.name.toLowerCase())) update({ _id: products.find(x => x.name.toLowerCase() === product.name.toLowerCase())._id, value: value}, response, JSON.stringify("OK"));
        })
        return;
    }

    // Handle request to DELETE the entire cart collection
    if (request.url === "/cart" && request.method === 'DELETE')
    {
        for (let item = (cart.length - 1); item >= 0; item--)
        {
            update({ _id: cart[item]._id, value: null });
        }
        console.log("Cart deleted");
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(JSON.stringify("OK"));
        return;
    }

    // Handle request to DELETE a product from the cart collection
    if (request.url.slice(0,6) === "/cart/" && request.method === 'DELETE')
    {
        let name = extractName(request.url, "/cart/");
        if (products.find(x => x.name.toLowerCase() === name.toLowerCase())) {
            console.log("Cart item deleted");
            response.writeHead(200, {'Content-Type': 'text/html'});
            update({ _id: products.find(x => x.name.toLowerCase() === name.toLowerCase())._id, value: null}, response, JSON.stringify("OK"));
        } else {
            console.log("Cart item was not found");
            textResponse(response, 404 , "Cart item was not found"); // Not Found
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.end(JSON.stringify("Not Found"));
        }
        return;
    }

    // Handle request to GET index.html file from the server
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

    // Handle request to GET files from the server
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

function indexOfId(array, id) {
    for (let index = 0; index < array.length; index++) {
        if(array[index]._id.toString() === id.toString()) {
            return index;
        }
    }
    return -1;
}

function findProduct(name) {
    let product;
    for (p in products) {
        if (products[p].name.toLowerCase() === name.toLowerCase())
        {
            product = products[p];
            break;
        }
    }
    return product;
}

function findCartItem(id) {
    let item;
    for (i in cart) {
        if (cart[i]._id.toString() === id.toString())
        {
            item = cart[i];
            break;
        }
    }
    return item;
}

function findImage(id) {
    let image;
    for (i in images) {
        if (images[i]._id.toString().toLowerCase() === id.toString())
        {
            image = images[i];
            break;
        }
    }
    return image;
}

function extractName(url, path) {
    let name = decodeURI(url.slice(path.length)).toLowerCase();
    if (name.indexOf("?") !== -1) return name.slice(0, name.indexOf("?"));
    return name;
}
