import React, { useState } from "react";

import "./index.css";
import ProductsPage from "./ProductsPage";
import SelectedProduct from "./SelectedProduct";
function Products() {
  const [selectedProducts,setSelectedProducts] = useState({})
  return (
    <div className="productWrapper">
      {Object.keys(selectedProducts).length === 0? 
      <ProductsPage selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts}/>
      :
      <SelectedProduct selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts}/>
    }
    </div>
  );
}

export default Products;
