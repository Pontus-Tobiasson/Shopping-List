import React, { useState, useContext } from 'react';
import { AppContext } from './index';

const Categories = () => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);
    function initiateCategories() {
        const uniqueCategories = [...new Set(["All", ...products.map(product => product.category).sort((a, b) => 
        (a.toLowerCase() > b.toLowerCase()) ? 1 : ((b.toLowerCase() > a.toLowerCase()) ? -1 : 0))])];
        const categoryList = uniqueCategories.map(cat => cat === category
            ? <div className="category category-target " key={cat} onClick={() => setCategory(cat)}>
                <img className="category-target-icon" src={require("../src/images/check-white.svg")} alt={"Selected icon"}></img>
                {cat}
            </div>
            : <div className="category" key={cat} onClick={() => setCategory(cat)}>{cat}</div>)
        return categoryList;
    }

    return (
        <div className="categories" onClick={() => document.body.classList.remove('cat-is-open')}>
            {initiateCategories()}
        </div>
    );
}

export default Categories;
