import React, { useState, useContext } from 'react';
import { AppContext } from './index';

const SearchBar = () => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);
    function resetButton() {
        if (search !== "") return (<img className="searchReset red-hover" src={require("../src/images/cancel-black.svg")} onClick={() => setSearch("")} alt={"Reset search"}></img>);
    }
    return (
        <div className="searchBar">
        <input className="searchInput" type="text" id="searchBar" placeholder="Search" onChange={(event) => setSearch(event.target.value)} value={search}></input>
        {resetButton()}
        </div>
    );
}

const NavBar = () => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    return (
        <div className="navbar">
            <div className="search-group">
                <div className="categories-dropdown" onClick={() => document.body.classList.toggle('cat-is-open')}>
                    <div className="categories-selected">{category}</div>
                    <img className="categories-button blue-hover"></img>
                </div>
                <SearchBar />
            </div>
            <div className="title">Shopping List</div>
            <img className="cart-button blue-hover" onClick={() => document.body.classList.toggle('cart-is-open')}></img>
        </div>
    );
}

export default NavBar;
