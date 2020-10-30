import React, { useState, useContext } from 'react';
import { AppContext } from './index';
import validateNumericInput from './validateNumericInput.js';
import '../src/Cart.css';
import serverAddress from './Variables.js'

function sortProducts(products) {
    let sortedProducts = products;
    sortedProducts.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    sortedProducts.sort((a,b) => (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0));
    return sortedProducts
}

const CartNavbar = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    function deleteProducts() {
        fetch(serverAddress+"/cart", { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            props.refreshProducts();
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    function printProducts() {
        const sortedProducts = sortProducts(products);
        const printDiv = document.createElement("div");
        let previousCategory = "";
        for (let item in sortedProducts) {
            let newDiv = document.createElement("div");
            if (sortedProducts[item].value > 0) {
                if (previousCategory !== sortedProducts[item].category) {
                    if (previousCategory !== "") newDiv.appendChild(document.createElement("br"));
                    newDiv.appendChild(document.createTextNode(sortedProducts[item].category));
                    newDiv.appendChild(document.createElement("br"));
                    previousCategory = sortedProducts[item].category;
                }
                newDiv.appendChild(document.createTextNode(sortedProducts[item].name + " " + sortedProducts[item].value));
                printDiv.appendChild(newDiv);
            }
        }
        document.getElementById("root").style.display = "none";
        document.getElementById("list").innerHTML = '';
        document.getElementById("list").append(printDiv);
        window.print();
        document.getElementById("list").innerHTML = '';
        document.getElementById("root").style.display = "block";
    }

    return (
        <div className="cart-navbar">
        <img className="cart-navbar-print blue-hover" src={require("../src/images/print-black.svg")}  onClick={() => printProducts()} alt={"Print icon"}></img>
        <div className="cart-title">Shopping List</div>
        <img className="cart-navbar-delete red-hover" src={require("../src/images/delete-black.svg")}  onClick={() => deleteProducts()} alt={"Delete icon"}></img>
        </div>
    );
}

const CartProduct = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    const handleChange = setChange.bind(this);
    function setChange(event) {
        let newValue = parseInt(event.target.value, 10);
        fetch(serverAddress+"/cart/"+props.name, { method: 'PUT', body: JSON.stringify({ name: props.name, value: newValue })})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            props.refreshProducts();
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    function deleteProduct() {
        fetch(serverAddress+"/cart/"+props.name, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            props.refreshProducts();
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    return (
        <div className="cart-product">
        <p className="cart-product-name">{props.name}</p>
        <input className="cart-product-input" type="text" onKeyPress={validateNumericInput.bind(this)} onChange={handleChange} value={props.value}></input>
        <img className="cart-product-delete red-hover" src={require("../src/images/delete-black.svg")} onClick={() => deleteProduct()} alt={"Delete icon"}></img>
        </div>
    );
}

const Cart = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    function displayList() {
        const list = [];
        const sortedProducts = sortProducts(products);
        let previousCategory = "";
        for (let product in sortedProducts) {
            if (sortedProducts[product].value > 0) {
                if (previousCategory !== sortedProducts[product].category) {
                    list.push(<div key={"Category"+sortedProducts[product].category} className="cart-category-title">{sortedProducts[product].category}</div>);
                }
                list.push(<div key={"Product"+sortedProducts[product].name}>{<CartProduct refreshProducts={props.refreshProducts} name={sortedProducts[product].name} category={sortedProducts[product].category} value={sortedProducts[product].value}/>}</div>);
                previousCategory = sortedProducts[product].category
            }
        }
        return list;
    }

    return (
        <div className="cart">
        <CartNavbar refreshProducts={props.refreshProducts}/>
        {displayList()}
        </div>
    );
}

export default Cart;
