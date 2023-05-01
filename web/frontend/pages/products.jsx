import React from 'react'
import { useAppQuery } from "../hooks";

function products() {
    const {data} = useAppQuery({url: "/api/products"});
    console.log("data",data);

  return (
    <div>products</div>
  )
}

export default products