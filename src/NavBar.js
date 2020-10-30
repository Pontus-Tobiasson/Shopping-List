import React, { useState, useContext } from 'react';
import { AppContext } from './index';

const SearchBar = () => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);
    const handleChange = setChange.bind(this);

    function setChange(event) {
        setSearch(event.target.value);
    }

    return (
        <input className="searchBar" type="text" id="searchBar" placeholder="Search" onChange={handleChange}></input>
    );
}

const NavBar = () => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    return (
        <div className="navbar">
            <div className="search-group">
                <div className="categories-dropdown" onClick={() => document.body.classList.toggle('cat-is-open')}>
                    <div className="categories-selected">All</div>
                    <img className="categories-button blue-hover"></img>
                </div>
                <SearchBar />
            </div>
            <div className="title">Groceries</div>
            <img className="cart-button blue-hover" onClick={() => document.body.classList.toggle('cart-is-open')}></img>
        </div>
    );
}

export default NavBar;
