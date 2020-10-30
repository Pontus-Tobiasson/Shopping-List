import React, { useState, useContext, createContext } from 'react';
import { AppContext } from './index';
import validateNumericInput from './validateNumericInput.js';
import '../src/ProductList.css';
import serverAddress from './Variables.js'

// Product in the product list
const Product = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);
    const [cacheNumbers, setCacheNumbers] = useContext(CacheContext);
    const [newName, setNewName] = useState(props.name);
    const [newCategory, setNewCategory] = useState(props.category);
    const [image, setImage] = useState(null);
    const [hovering, setHovering] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function remove() {
        fetch(serverAddress+"/products/"+props.name, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let card = document.getElementById("product-card-"+props.name);
            card.style.opacity = '0';
            window.setTimeout(
                function deleteCard()
                {
                    card.style.display='none';
                    props.refreshProducts();
                    if (products.filter(product => product.category === props.category).length === 1) {
                        setCategory("All");
                    }
                }, 1250);
            })
            .catch(function(error) {
                console.log(error);
            });
        }

        const handleName = changeName.bind(this);
        function changeName(event) {
            setNewName(event.target.value);
        }

        const handleCategory = changeCategory.bind(this);
        function changeCategory(event) {
            setNewCategory(event.target.value);
        }

        const handleValue = changeValue.bind(this);
        function changeValue(event) {
            sendValue(parseInt(event.target.value, 10));
        }

        function sendValue(value) {
            fetch(serverAddress+"/cart/"+props.name, { method: 'PUT', body: JSON.stringify({ name: props.name, value: value })})
            .then(response => response.json())
            .then(data => {
                console.log(data);
                props.refreshProducts();
            })
            .catch(function(error) {
                console.log(error);
            });
        }

        const handleDragEnter = dragEnter.bind(this);
        function dragEnter(event) {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.add('drop-target');
        }

        const handleDragLeave = dragLeave.bind(this);
        function dragLeave(event) {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.remove('drop-target');
        }

        const handleDragOver = dragOver.bind(this);
        function dragOver(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const handleDrop = drop.bind(this);
        function drop(event) {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.remove('drop-target');
            const url = event.dataTransfer.getData('text/plain');
            console.log(url || [...event.dataTransfer.files]);
            if(url) {
                console.log("Please drop a file instead of an URL");
                alert("Please drop a file instead of an URL");
            } else {
                handleFiles(event.dataTransfer.files);
            }
        }

        function handleFiles(files) {
            let canvas = document.getElementById("canvas-create-"+props.name);
            let context = canvas.getContext("2d");
            let file;

            for (let i = 0; i < files.length; i++) {
                file = files[i];
                let imageType = /image.*/;
                if (!file.type.match(imageType)){continue;}
            }
            setImage(file);

            // Draw a preview image of the dropped file on a canvas
            let preview = document.createElement("img");
            let reader = new FileReader();
            reader.onload=(function(previewImage){
                return function(event) {
                    previewImage.onload=function(){
                        let scale = 94 / previewImage.width;
                        if (previewImage.width < previewImage.height) scale = 94 / previewImage.height;
                        let width = Math.floor(previewImage.width * scale, 10);
                        let height = Math.floor(previewImage.height * scale, 10);
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(previewImage, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, width, height)

                    }
                    previewImage.src = event.target.result;
                };
            })(preview);
            reader.readAsDataURL(file);
        }

        function save() {
            if (products.filter(product => product.category === newCategory).length === 0)
            if(!window.confirm("Are you sure you want to create the new category " + newCategory + "?"))
            return;

            const formData = new FormData();
            formData.append('name', newName);
            formData.append('category', newCategory);
            formData.append('image', image);
            console.log(formData);
            const options = {
                method: 'PUT',
                body: formData,
            };
            fetch(serverAddress+"/products/"+props.name, options)
            .then(response => {
                if (response.status === 200) {
                    if (cacheNumbers[props.name] === undefined) {
                        let tempCache = cacheNumbers;
                        tempCache[props.name] = 0;
                        setCacheNumbers(tempCache);
                    } else {
                        let tempCache = cacheNumbers;
                        tempCache[props.name]++;
                        setCacheNumbers(tempCache);
                    }
                    props.refreshProducts();
                    setEditing(false);
                } else if (response.status === 409)
                {
                    alert("A product with that name already exists");
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        }

        return (
            <div className="product" id={"product-card-"+props.name}>
            <div className={["product-card", deleting ? " deleting" : "",editing ? " editing" : ""].join('')}>
            <div className="product-front-side">
            <div className="product-card-update">
            <img className="product-card-icon red-hover" src={require("../src/images/delete-black.svg")} onClick={() => setDeleting(true)} alt={"Delete icon"}></img>
            <img className="product-card-icon blue-hover" src={require("../src/images/edit-black.svg")} onClick={() => setEditing(true)} alt={"Edit icon"}></img>
            <img className="product-card-expand" src={require("../src/images/expand_more-black.svg")} alt={"Expand icon"}></img>
            </div>
            <div className="product-card-title">{props.name}</div>
            <img src={serverAddress+"/images/"+props.name+"?"+cacheNumbers[props.name]}></img>
            <div className="product-card-input">
            <img className="product-card-input-minus" onClick={() => sendValue(props.value - 1)}></img>
            <div>
            <input type="text" className="product-card-input-text" onKeyPress={validateNumericInput.bind(this)} onChange={handleValue} value={props.value}></input>
            </div>
            <img className="product-card-input-plus" onClick={() => sendValue(props.value + 1)}></img>
            </div>
            </div>
            <div className="product-card-editing">
            <div className="product-card-update">
            <img className="product-card-icon blue-hover" src={require("../src/images/cancel-black.svg")} onClick={() => setEditing(false)} alt={"Cancel icon"}></img>
            <img className="product-card-icon blue-hover" src={require("../src/images/save-black.svg")} onClick={() => save()} alt={"Save icon"}></img>
            <img className="product-card-expand" src={require("../src/images/expand_more-black.svg")} alt={"Expand icon"}></img>
            </div>
            <input type="text" className="product-card-name" onChange={handleName} placeholder={props.name} onChange={handleName}></input>
            <div className="product-card-background"></div>
            <img className="transparent-image" src={serverAddress+"/images/"+props.name+"?"+cacheNumbers[props.name]}></img>
            <div className="drop-text">Drop New Image Here</div>
            <canvas className="canvas-preview" id={"canvas-create-"+props.name} width={94} height={94}></canvas>
            <div className="product-add-image" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}></div>
            <input type="text" className="product-card-category" placeholder={props.category} onChange={handleCategory}></input>
            </div>
            <div className="product-back-side">
            <div className="product-card-title">{props.name}</div>
            <div className="product-back-delete" onClick={() => remove()}>Delete</div>
            <div className="product-back-cancel" onClick={() => setDeleting(false)}>Cancel</div>
            </div>
            </div>
            </div>
        );
    }

    const CreateProduct = (props) => {
        const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);
        const [cacheNumbers, setCacheNumbers] = useContext(CacheContext);
        const [newName, setNewName] = useState("");
        const [newCategory, setNewCategory] = useState("");
        const [image, setImage] = useState(null);
        const [creating, setCreating] = useState(false);

        const handleName = changeName.bind(this);
        function changeName(event) {
            setNewName(event.target.value);
        }

        const handleCategory = changeCategory.bind(this);
        function changeCategory(event) {
            setNewCategory(event.target.value);
        }

        const handleDragEnter = dragEnter.bind(this);
        function dragEnter(event) {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.add('drop-target');
        }

        const handleDragLeave = dragLeave.bind(this);
        function dragLeave(event) {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.remove('drop-target');
        }

        const handleDragOver = dragOver.bind(this);
        function dragOver(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const handleDrop = drop.bind(this);
        function drop(event) {
            event.preventDefault();
            event.stopPropagation();
            event.target.classList.remove('drop-target');
            const url = event.dataTransfer.getData('text/plain');
            console.log(url || [...event.dataTransfer.files]);
            if(url) {
                console.log("Please drop a file instead of an URL");
                alert("Please drop a file instead of an URL");
            } else {
                handleFiles(event.dataTransfer.files);
            }
        }

        function handleFiles(files) {
            let canvas = document.getElementById("canvas-create");
            let context = canvas.getContext("2d");
            let file;
            for (let i = 0; i < files.length; i++) {
                file = files[i];
                let imageType = /image.*/;
                if (!file.type.match(imageType)){continue;}
            }
            setImage(file);

            // Draw a preview image of the dropped file on a canvas
            let preview = document.createElement("img");
            var reader=new FileReader();
            reader.onload=(function(previewImage){
                return function(event) {
                    previewImage.onload=function(){
                        let scale = 94 / previewImage.width;
                        if (previewImage.width < previewImage.height) scale = 94 / previewImage.height;
                        let width = Math.floor(previewImage.width * scale, 10);
                        let height = Math.floor(previewImage.height * scale, 10);
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(previewImage, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, width, height)
                    }
                    previewImage.src = event.target.result;
                };
            })(preview);
            reader.readAsDataURL(file);
        }

        function save() {
            const formData = new FormData();
            formData.append('name', newName);
            formData.append('category', newCategory);
            formData.append('image', image);
            const options = {
                method: 'POST',
                body: formData,
            };
            fetch(serverAddress+"/products", options)
            .then(response => {
                if (response.status === 200) {
                    if (cacheNumbers[newName] === undefined) {
                        let tempCache = cacheNumbers;
                        tempCache[newName] = 0;
                        setCacheNumbers(tempCache);
                    } else {
                        let tempCache = cacheNumbers;
                        tempCache[newName]++;
                        setCacheNumbers(tempCache);
                    }
                    setSearch(newName);
                    props.refreshProducts();
                } else if (response.status === 409) {
                    alert("A product with that name already exists");
                }
            })
            .catch(function(error) {
            });
            document.getElementById('searchBar').value = newName;
            setSearch(newName);
        }

        function resetSearch() {
            document.getElementById('searchBar').value = "";
            setSearch("");
        }

        return (
            <div className="product">
            <div className={["product-card", creating ? " creating" : "",creating ? " editing" : ""].join('')}>
            <div className="product-create-prompt">
            <div className="product-create-text">{"Product does not exist."}</div>
            <div className="product-create-text">{"Do you want to create it?"}</div>
            <div className="product-create-button" onClick={() => setCreating(true)}>Create</div>
            <div className="product-back-cancel" onClick={() => resetSearch()}>Cancel</div>
            </div>
            <div className="product-card-creating">
            <div className="product-card-update">
            <img className="product-card-icon blue-hover" src={require("../src/images/cancel-black.svg")} onClick={() => resetSearch()} alt={"Cancel icon"}></img>
            <img className="product-card-icon blue-hover" src={require("../src/images/save-black.svg")} onClick={() => save()} alt={"Save icon"}></img>
            <img className="product-card-expand" src={require("../src/images/expand_more-black.svg")} alt={"Expand icon"}></img>
            </div>
            <input type="text" className="product-card-name" onChange={handleName} placeholder="Name" onChange={handleName}></input>
            <div className="product-card-background"></div>
            <div className="drop-text">Drop New Image Here</div>
            <canvas className="canvas-preview" id="canvas-create" width={94} height={94}></canvas>
            <div className="product-add-image" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}></div>
            <input type="text" className="product-card-category" placeholder="Category" onChange={handleCategory}></input>
            </div>
            </div>
            </div>

        );
    }

    export const CacheContext = createContext();

    const ProductList = (props) => {
        const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);
        const [cacheNumbers, setCacheNumbers] = useState([]);

        function displayProducts() {
            let matchingProducts = [];
            let exactMatch = false;
            for (let product in products) {
                if(products[product].name.toLowerCase() === search.toLowerCase() || products[product].category.toLowerCase() === search.toLowerCase() || search === "") exactMatch = true;
                if ((products[product].category.toLowerCase() === category.toLowerCase() || category === "All")
                && (products[product].name.toLowerCase().includes(search.toLowerCase()) || products[product].category.toLowerCase().includes(search.toLowerCase()) || search.length === 0 || search === false)) {
                    matchingProducts.push(products[product]);
                }
            }
            if (exactMatch) {
                return (
                    <CacheContext.Provider value={[cacheNumbers, setCacheNumbers]}>
                    <div className="product-container">
                    {matchingProducts.map(product => <div className="product-grid-item" key={product.name}>{<Product refreshProducts={props.refreshProducts} name={product.name} category={product.category} value={product.value}/>}</div>)}
                    </div>
                    </CacheContext.Provider>
                );
            } else {
                return (
                    <CacheContext.Provider value={[cacheNumbers, setCacheNumbers]}>
                    <div className="product-container">
                    <CreateProduct refreshProducts={props.refreshProducts}/>
                    {matchingProducts.map(product => <div className="product-grid-item" key={product.name}>{<Product refreshProducts={props.refreshProducts} name={product.name} category={product.category} value={product.value}/>}</div>)}
                    </div>
                    </CacheContext.Provider>
                );
            }
        }

        return (
            <div>
            {displayProducts()}
            </div>
        );
    }

    export default ProductList;