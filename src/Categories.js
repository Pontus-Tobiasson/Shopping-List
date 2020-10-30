import React, { useState, useContext } from 'react';
import { AppContext } from './index';

const Categories = () => {
    const [products, setProducts, category, setCategory, search, setSearch, cart, setCart] = useContext(AppContext);

    function initiateCategories() {
        const sortedCategories = [...products].sort((a,b) => (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0));
        let uniqueCategories = ["All"];
        let previousCategory = "All";
        // Find and add unique categories to uniqueCategories
        for (let cat in sortedCategories) {
            if (sortedCategories[cat].category != previousCategory && sortedCategories[cat].category != "All") {
                previousCategory = sortedCategories[cat].category;
                uniqueCategories.push(sortedCategories[cat].category);
            }
        }

        const categoryList = [];
        // Insert unique categories into the category list and set category-target on the selected category
        for (const [index, cat] of uniqueCategories.entries()) {
            if (cat === category) {
                categoryList.push(<div className="category category-target" key={cat} onClick={() => setCategory(cat)}>{cat}</div>)
            } else {
                categoryList.push(<div className="category" key={cat} onClick={() => setCategory(cat)}>{cat}</div>)
            }
        }
        return categoryList;
    }

    return (
        <div className="categories" onClick={() => document.body.classList.remove('cat-is-open')}>
            {initiateCategories()}
        </div>
    );
}

export default Categories;
