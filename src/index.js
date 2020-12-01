import React, { useState, createContext } from 'react';
import ReactDOM from 'react-dom';
import '../src/index.css';
import NavBar from './NavBar.js';
import Categories from './Categories.js';
import ProductList from './ProductList.js';
import Cart from './Cart.js';
import { serverAddress } from './Variables.js'

export const AppContext = createContext();

export const App = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("All");
    const [cart, setCart] = useState(false);
    const [search, setSearch] = useState("");

    const [initiated, setInitiated] = useState(false);
    if (!initiated) {
        setInitiated(true);
        refreshProducts();
    }

    function refreshProducts() {
        fetch(serverAddress + "/products", { method: 'GET' })
        .then(response => response.json())
        .then(serverProducts => {
            fetch(serverAddress + "/cart", { method: 'GET' })
            .then(response => response.json())
            .then(serverCart => loadProducts(serverProducts, setProducts, serverCart))
            .catch(function(error) {
                console.log(error);
            });
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    return (
        <div className="page">
        <AppContext.Provider value={[products, setProducts, category, setCategory, search, setSearch, cart, setCart]}>
        <NavBar />
        <ProductList refreshProducts={refreshProducts}/>
        <Cart refreshProducts={refreshProducts}/>
        <Categories />
        </AppContext.Provider>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));

function loadProducts(products, setProducts, cart) {
    const newProducts = [];
    for (let product in products) {
        newProducts.push({ name: products[product].name, category: products[product].category,
            value: cart.find(item => item.name === products[product].name) ? cart.find(item => item.name === products[product].name).value : 0 });
    }
    newProducts.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
    setProducts(newProducts);
}