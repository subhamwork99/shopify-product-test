import React, { useEffect } from 'react'
import { useAppQuery } from "../hooks";
import { useEffect, useState } from "react"

function products() {
    // const {data} = useAppQuery({url: "/api/products"});
    // console.log("data",data);
    useEffect(()=>{
        getResult()
      })

    const getResult = async () => {
        let showResult = await fetch('http://localhost:8081/api/products')
        showResult = await showResult.json()
        console.log("showResult",showResult);
    }


  return (
    <div>products</div>
  )
}

export default products