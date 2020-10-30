import React, { useState, useContext, createContext } from 'react';
import ReactDOM from 'react-dom';
import '../src/index.css';
import NavBar from './NavBar.js';
import Categories from './Categories.js';
import ProductList from './ProductList.js';
import Cart from './Cart.js';
import serverAddress from './Variables.js'

export const AppContext = createContext();

export const App = () => {
    const [products, setProducts] = useState([]);
    if (products.length === 0) refreshProducts(); // initiate
    const [category, setCategory] = useState("All");
    const [cart, setCart] = useState(false);
    const [search, setSearch] = useState("");

    // Get and update using the latest data from the server
    function refreshProducts() {
        let newProducts = [];
        fetch(serverAddress+"/products", { method: 'GET' })
        .then(response => response.json())
        .then(prods => {
            fetch(serverAddress+"/cart", { method: 'GET' })
            .then(response => response.json())
            .then(cart => {
                for (let product in prods) {
                    newProducts.push({ name: prods[product].name, category: prods[product].category,
                        value: cart.find(item => item.name === prods[product].name) ? cart.find(item => item.name === prods[product].name).value : 0 });
                }
                newProducts.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                setProducts(newProducts);
            })
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
