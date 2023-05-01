import React from 'react'

function products() {
    const {data} = useAppQuery({url: "/api/products"});
    console.log("data",data);
    
  return (
    <div>products</div>
  )
}

export default products