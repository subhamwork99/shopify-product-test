import React, { useEffect } from "react";
import { useAppQuery } from "../hooks";
import { Button } from "@shopify/polaris";


const Demo = () => {
  const {data} = useAppQuery({url: "/api/products"});
  console.log("data",data);

  // const handleSubmit = async () => {
  //   let result = await fetch('http://localhost:8080/register', {
  //     method: 'post',
  //     body: JSON.stringify({ data }),
  //     // body: JSON.stringify({ name: value.name, email: value.email, password: value.password }),
  //     headers: {
  //       'Content-Type': "application/json"
  //     }
  //   })
  // }

  // useEffect(() => {
  //   getResult();
  // }, []);

  // const getResult = async () => {
  //   // let showResult = await fetch("/api/products")
  //   // .then((res)=>{
  //   //   console.log("res",res);
  //   // })
  //   // .catch((error)=>{
  //   //   console.log("error",error);
  //   // })
  //   // // showResult = await showResult.json()
  //   // // setRegisterData(showResult)
  //   // console.log("demoProductData", showResult);

  //   showData = await fetch("/api/products")
  //   .then((res)=>{
  //     console.log("res",res);
  //   })
  //   .catch((error)=>{
  //     console.log("error",error);
  //   })
  //   console.log("showData",showData);
  // };



  return (
    <>
      <h1>This is Demo</h1>
      {/* <Button onClick={handleSubmit} >Add product</Button> */}
    </>
  );
};

export default Demo;
