import React, { useState, useContext } from 'react';
import { AppContext } from './index';
import validateNumericInput from './validateNumericInput.js';
import '../src/Cart.css';
import { serverAddress } from './Variables.js'

function sortProducts(products) {
    return products.sort((a, b) => {
        const a_cat_L = a.category.toLowerCase();
        const b_cat_L = b.category.toLowerCase();
        if (a_cat_L !== b_cat_L) return a_cat_L > b_cat_L ? 1 : -1;

        const a_name_L = a.name.toLowerCase()
        const b_name_L = b.name.toLowerCase()
        return a_name_L > b_name_L ? 1 : (b_name_L > a_name_L) ? -1 : 0;
    });
}

const CartFooter = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    function deleteCart() {
        fetch(serverAddress+"/cart", { method: 'DELETE' })
        .then(response => {
            if (response.status === 200) props.refreshProducts();
        })
        .catch(function(error) {
            console.error(error);
        });
    }

    function formatPrint(print) {
        if (typeof print === 'string') {
            return print.slice(0, 30);
        }
        if (typeof print === 'number') {
            print = print.toString();
            const length = print.length;

            if (length > 4) return print.slice(0, 4) + "\u00A0\u00A0";

            for (let i = length; i < 5; i++) {
                print += '\u00A0\u00A0';
            }
            return print;
        }
        return undefined;
    }

    function printProducts() {
        const sortedProducts = sortProducts(products);
        const printDiv = document.createElement("div");
        let previousCategory = "";
        for (const item in sortedProducts) {
            const product = sortedProducts[item];
            let newDiv = document.createElement("div");
            if (product.value > 0) {
                if (previousCategory !== product.category) {
                    if (previousCategory !== "") newDiv.appendChild(document.createElement("br"));
                    let cat = document.createElement("b");
                    cat.innerHTML = formatPrint(product.category);
                    newDiv.appendChild(cat);
                    newDiv.appendChild(document.createElement("br"));
                    previousCategory = product.category;
                }
                newDiv.appendChild(document.createTextNode(formatPrint(product.value)));
                newDiv.appendChild(document.createTextNode(formatPrint(product.name)));
                printDiv.appendChild(newDiv);
            }
        }
        document.getElementById("root").style.display = "none";
        document.getElementById("list").innerHTML = '';
        document.getElementById("list").append(printDiv);
        window.print();
        document.getElementById("list").innerHTML = '';
        document.getElementById("root").style.display = "";
    }

    return (
        <div className="cart-footer">
        <button onClick={deleteCart}><img src={require("../src/images/delete-black.svg")} alt={"Delete icon"}></img> Clear</button>
        <button onClick={printProducts}><img src={require("../src/images/print-black.svg")} alt={"Print icon"}></img> Print</button>
        </div>
    );
}

const CartProduct = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    const handleSelect = (event) => event.target.select();
    const handleValue = (event) => sendValue(parseInt(event.target.value, 10));
    function sendValue(value) {
        if (value < 0) return;
        if (isNaN(value)) value = 0;
        let temp_products = products;
        temp_products.find(product => product.name === props.name).value = value;
        setProducts([...temp_products]);
        fetch(serverAddress+"/cart/"+props.name, { method: 'PUT', body: JSON.stringify({ value: value })})
        .then(() => props.refreshProducts())
        .catch(function(error) {
             console.log(error);
         });
    }

    function deleteProduct() {
        fetch(serverAddress+"/cart/"+props.name, { method: 'DELETE' })
        .then(response => {
            if (response.status === 200) props.refreshProducts();
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    return (
        <div className="cart-product">
        <p className="cart-product-name">{props.name}</p>
        <input className="cart-product-input" type="text" onKeyPress={validateNumericInput.bind(this)} onClick={handleSelect} onChange={handleValue} value={parseInt(props.value, 10)}></input>
        <img className="cart-product-delete red-hover" src={require("../src/images/delete-black.svg")} onClick={deleteProduct} alt={"Delete icon"}></img>
        </div>
    );
}

const Cart = (props) => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    function displayList() {
        const list = [];
        const sortedProducts = sortProducts([...products]);
        let previousCategory = "";
        for (let product in sortedProducts) {
            if (sortedProducts[product].value > 0) {
                if (previousCategory !== sortedProducts[product].category) {
                    list.push(<div key={"Category" + sortedProducts[product].category} className="cart-category-title">{sortedProducts[product].category}</div>);
                    previousCategory = sortedProducts[product].category
                }
                list.push(<div key={"Product" + sortedProducts[product].name}>{<CartProduct refreshProducts={props.refreshProducts} name={sortedProducts[product].name} category={sortedProducts[product].category} value={sortedProducts[product].value}/>}</div>);
            }
        }
        return list;
    }

    return (
        <div className="cart">
        <div className="cart-title">Shopping List</div>
        <div className="cart-list">{displayList()}</div>
        <CartFooter refreshProducts={props.refreshProducts}/>
        </div>
    );
}

export default Cart;
