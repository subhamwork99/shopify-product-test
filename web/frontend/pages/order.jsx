import React from 'react'
import { Button } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

function Order() {
  const fetch = useAuthenticatedFetch();
  const handleOrders = async() =>{
    const responseOrderApi = await fetch("/api/orders/count");
    console.log("responseApi", responseOrderApi)
  }
  const Random = async() =>{
    const responseOrderApi = await fetch("/api/related-product");
    console.log("responseApi", responseOrderApi)
  }
  // const Random = async() =>{
  //   useAppQuery({
  //     url: "/api/releted-Product",
  //   });
  // }
  const addTheme = async() =>{
    const responseOrderApi = await fetch("/api/handle");
    console.log("responseApi", responseOrderApi)
  }
  return (
    <div>
      {/* <Button onClick={handleOrders}>Orders</Button> */}
      {/* <Button onClick={Random}>random</Button> */}
      <Button onClick={addTheme}>Add Theme</Button>
    </div>
  )
}

export default Order