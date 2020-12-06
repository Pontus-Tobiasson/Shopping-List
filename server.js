// Server side implementation for the Shopping list application

const MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb://localhost:27017/";
//const dburl = "mongodb+srv://"+process.env.MONGODB_USERNAME+":"+process.env.MONGODB_PASSWORD+"@cluster0.26pqd.gcp.mongodb.net/shoppingdb?retryWrites=true&w=majority";
const port = process.env.PORT || 8080;
const database = "shoppingdb";

const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs');
const sharp = require('sharp');
const formidable = require('formidable');
const path = require('path')

function indexOfId(array, id) {
    const _id = id.toString();
    return array.findIndex(item => item._id.toString() === _id);
}

function findProduct(name) {
    const _name = name.toLowerCase();
    return products.find(product => product.name.toLowerCase() === _name);
}

function findImage(id) {
    const _id = id.toString();
    return images.find(image => image._id.toString() === _id);
}

let products = []; // All products. Format: { id: <MongoDB id>, name: <String>, category: <String> }
let cart = [];     // Items in the cart (current shopping list). Format: { id: <MongoDB id>, value: <Number> }
let images = [];   // Images for products. Format: { id: <MongoDB id>, image: <Object> }
let delta = [];    // All changes that have not yet been backed up to the database Format: { id: <MongoDB id>, name: <String>, category: <String> value: <Number> image: <Object> }

// Initiate products, cart and images with data from MongoDB
MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
    if (error) throw error;
    const dbo = db.db(database);
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
        for (let image in images) {
            images[image].image = images[image].image.buffer;
        }
    });
});

// Update local products, cart, images and delta
function update(entry, res, message) {
    const entry_id = entry._id.toString();
    if (entry === undefined) {
        console.log("update() called with empty update");
        return;
    }
    console.log("Updating local collections and delta");
    if (indexOfId(products, entry_id) === -1) products.push({ _id: entry._id, name: "", category: ""});
    if (indexOfId(delta, entry_id) === -1) delta.push({ _id: entry._id});

    if (entry.name !== undefined) {
        if (entry.name === null) {
            products.splice(indexOfId(products, entry._id), 1);
        } else {
            products.find(x => x._id.toString() === entry_id).name = entry.name;
        }
        delta.find(x => x._id.toString() === entry_id).name = entry.name;
    }

    if (entry.category !== undefined) {
        if (entry.category === null) {
            products.splice(indexOfId(products, entry._id), 1);
        } else {
            products.find(x => x._id.toString() === entry_id).category = entry.category;
        }
        delta.find(x => x._id.toString() === entry_id).category = entry.category;
    }

    if (entry.value !== undefined) {
        if (indexOfId(cart, entry_id)  === -1) cart.push({ _id: entry._id, value: 0});
        if (entry.value === null) {
            cart.splice(indexOfId(cart, entry._id), 1);
        } else {
            cart.find(x => x._id.toString() === entry_id).value = entry.value;
        }
        delta.find(x => x._id.toString() === entry_id).value = entry.value;
    }

    if (entry.image !== undefined) {
        if (indexOfId(images, entry_id)  === -1) images.push({ _id: entry._id, image: entry.image });
        if (entry.image === null) {   
            images.splice(indexOfId(images, entry._id), 1);
            sendResponse(res, message);
        } else {
            sharp(entry.image.path)
            .toBuffer((err, data, info) => {
                const scale = 94 / Math.max(info.width, info.height, 1)
                const width = Math.floor(info.width * scale, 10);
                const height = Math.floor(info.height * scale, 10);
                sharp(entry.image.path)
                .resize(width, height)
                .toFormat("png")
                .toBuffer((err, img, info) => {
                    fs.unlink(entry.image.path, (err) => {
                        if (err) {
                            console.log("failed to remove temp image");
                            throw err;
                        }
                    });
                    if (err) {
                        console.log("failed to convert image to buffer");
                        throw err;
                    }
                    images.find(x => x._id.toString() === entry_id).image = img;
                    delta.find(x => x._id.toString() === entry_id).image = img;
                    sendResponse(res, message);
                });
                if (err) {
                    console.log("failed to convert image to buffer");
                    throw err;
                }
            });
        }
    } else {
        sendResponse(res, message);
    }
}

function sendResponse(res, message) {
    if (res !== undefined) {
        if (isNaN(message)) {
            res.end(message);
        } else {
            res.sendStatus(message);
        }
    }
    queueUpdate();
}

let updating = false;

// Queues an update unless an update is already queued
function queueUpdate() {
    if (updating) {
        console.warn("Called update but an update is already queued");
        return;
    }
    updating = true;
    let delay = 10000;
    console.log("Starting " + (delay/1000) + " second update timer");
    setTimeout(save, delay);
}

function applyUpdateToMongo(snapshot_delta) {
    MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
        console.log("Saving changes");
        const dbo = db.db(database);
        snapshot_delta.forEach(change => {
            if (change._id === undefined) return;

            if (change.name !== undefined && change.category !== undefined) {
                if (change.name === null || change.category === null) {
                    dbo.collection("products").deleteOne({ _id: change._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Deleted product: " + change._id);
                    });
                } else {
                    let setProduct = { $set: { name: change.name, category: change.category } };
                    dbo.collection("products").updateOne({ _id: change._id }, setProduct, function(error, result) {
                        if (error) throw error;
                        console.log("Updated product: " + change._id);
                    });
                }
            }

            if (change.value !== undefined) {
                if (change.value === null) {
                    dbo.collection("cart").deleteOne({ _id: change._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Deleted cart value: " + change._id);
                    });
                } else {
                    let setValue = { $set: { value: change.value } };
                    dbo.collection("cart").updateOne({ _id: change._id }, setValue, { upsert: true }, function(error, result) {
                        if (error) throw error;
                        console.log("Updated cart value: " + change._id);
                    });
                }
            }

            if (change.image !== undefined) {
                if (change.value === null) {
                    dbo.collection("images").deleteOne({ _id: change._id }, function(error, result) {
                        if (error) throw error;
                        console.log("Deleted image: " + change._id);
                    });
                } else {
                    let setImage = { $set: { image: change.image } };
                    dbo.collection("images").updateOne({ _id: change._id }, setImage, { upsert: true }, function(error, result) {
                        if (error) throw error;
                        console.log("Updated image: " + change._id);
                    });
                }
            }
        })
    });
}

function save() {
    if (delta.length === 0) {
        console.log("No changes to save")
        updating = false;
        return;
    }
    const snapshot_delta = delta;
    delta = [];
    try {
        applyUpdateToMongo(snapshot_delta);
    } finally {
         updating = false;
         if (delta.length !== 0) queueUpdate();
    }
}

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());

app.get('/products', (req, res) => {
    console.log("Product data requested")
    const data = []
    for (let p in products) if (products[p].name !== "") data.push(products[p]);
    console.log("Sending product data");
    res.json(data);
});

app.get('/cart', (req, res) => {
    console.log("Cart data requested")
    const data = [];
    for (let item in cart) {
        let matchingProduct = products.find(product => product._id.toString() === cart[item]._id.toString());
        if (matchingProduct) data.push({ name: matchingProduct.name, value: cart[item].value});
    }
    console.log("Sending cart data")
    res.json(data);
});

app.get('/images/:image', (req, res) => {
    console.log("Image data requested");
    const {image} = req.params;
    const _image = image.toLowerCase();
    const product = findProduct(image);

    if (product === undefined) {
        console.log("Product does not exist");
        res.sendStatus(404);
        return;
    }

    const img = findImage(findProduct(_image)._id);
    if (img === undefined) {
        console.log("Sending default image");
        res.sendFile(__dirname + "/DefaultImage.png");
    } else {
        console.log("Sending product image");
        res.contentType('image/png');
        res.send(img.image);
    }
});

app.put('/cart/:item', (req, res) => {
    const {item} = req.params;
    console.log("Request to set value of cart item " + item);

    const product = findProduct(item);
    if (product === undefined) {
        console.log("Cart item " + item + " does not exist");
        return;
    }

    let value = JSON.parse(req.body).value;
    if (!(value >= 0)) value = 0;

    console.log("Setting " + item + " value in cart to " + value);
    update({ _id: product._id, value: value}, res, 200);
});

app.post('/products', (req, res) => {
    console.log("Request to post product");
    const formData = formidable({ multiples: true });
    formData.parse(req, (err, fields, files) => {
        if (err) {
            console.log("Failed to parse form data");
            console.error(err.message);
            return;
        }
        const product = { name: fields.name.toString(), category: fields.category.toString(), image: files.image };
        // Check that the product data contains both a name and a category
        if (!product.name || !product.category) {
            console.log("Product lacks necessary data");
            res.sendStatus(404);
            return;
        }
        if (findProduct(product.name)) {
            console.log("Product already exists");
            res.sendStatus(409);
            return;
        }
        
        MongoClient.connect(dburl, { useUnifiedTopology: true }, function(error, db) {
            const dbo = db.db(database);

            if (!findProduct("")) {
                console.log("No pre-generated product ID found");
                dbo.collection("products").insertOne({ name: "", category: "" }, function(error, result) {
                    if (error) throw error;
                    console.log("Generated product ID " + result.insertedId);
                    if (product.image  === undefined) {
                        update({ _id: result.insertedId, name: product.name, category: product.category });
                    } else {
                        update({ _id: result.insertedId, name: product.name, category: product.category, value: undefined, image: product.image }, res, 200);
                    }
                });
            } else if (product.image === undefined) {
                    update({ _id: findProduct("")._id, name: product.name, category: product.category }, res, 200);
                } else {
                    update({ _id: findProduct("")._id, name: product.name, category: product.category, value: undefined, image: product.image }, res, 200);
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
});

app.put('/products/:oldName', (req, res) => {
    const {oldName} = req.params;
    console.log("Request to make a put on product " + oldName);
    if (!findProduct(oldName))
    {
        console.log("A product with the name " + oldName + " does not exist");
        res.sendStatus(400);
        return;
    }
    const formidable = require('formidable');
    const formData = formidable({ multiples: true });
    formData.parse(req, (err, fields, files) => {
        if (err) console.error(err);
        if (!fields.name || !fields.category)
        {
            console.log("POST product lacks necessary data")
            res.sendStatus(400);
            return;
        }
        if (findProduct(fields.name) && fields.name.toLowerCase() !== oldName.toLowerCase())
        {
            console.log("A product with the name " + fields.name + " already exists");
            res.sendStatus(409);
            return;
        }
        const product = { name: fields.name, category: fields.category, image: files.image };

        console.log("Updating " + product.name);
        if (product.image === undefined) {
            update({ _id: findProduct(oldName)._id, name: product.name, category: product.category }, res, 200);
        } else {
            update({ _id: findProduct(oldName)._id, name: product.name, category: product.category, value: undefined, image: product.image }, res, 200);
        }
    });
});

app.delete('/products/:product', (req, res) => {
    const {product} = req.params;
    console.log("Request to delete product " + product);
    let prod = findProduct(product);
    if (prod !== undefined) {
        console.log("Deleting product " + product);
        update({ _id: prod._id, name: null, category: null, value: null, image: null }, res, 200);
    } else {
        console.log("Product " + product + " not found");
        res.sendStatus(404);
    }
});

app.delete('/cart', (req, res) => {
    console.log("Request to delete cart");
    for (let item = (cart.length - 1); item >= 0; item--)
    {
        update({ _id: cart[item]._id, value: null });
    }
    console.log("Cart deleted");
    res.sendStatus(200);
});


app.delete('/cart/:item', (req, res) => {
    const {item} = req.params;
    console.log("Request to delete cart item " + item);

    const product = findProduct(item);
    if (product === undefined) {
        console.log("Cart item " + item + " was not found");
        res.sendStatus(404);
    } else {
        console.log("Cart item " + item + " deleted");
        update({ _id: product._id, value: null}, res, 200);
    }
});

app.get('/', (req, res) => {
    console.log("Request to get index file");
    res.sendFile(__dirname + "/build/index.html");
    console.log("Sending index file");
});

app.get('*', (req, res) => {
    console.log("Request to get file " + req.url);
    if (req.url.includes("..")) {
        console.error(req.url + " is outside of the designated folder");
        return;
    }

    if(path.extname(req.url) === ".html") {
        res.writeHead(200, {'Content-Type': 'text/html'});
    } else if (path.extname(req.url) === ".js") {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
    } else if (path.extname(req.url) === ".css") {
        res.writeHead(200, {'Content-Type': 'text/css'});
    } else if (path.extname(req.url) === ".svg") {
        res.writeHead(200, {'Content-Type': 'image/svg+xml'});
    }
    
    res.sendFile(__dirname + "/build/" + req.url);
    console.log("Sending file " + req.url);
});

const server = app.listen(port, () => {
    const {address, port} = server.address();
    console.log("Shoplist sever listening at http://" + address + ":" + port);
});