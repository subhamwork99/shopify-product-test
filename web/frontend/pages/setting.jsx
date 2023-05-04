import React from "react";
import { Button } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

function Setting() {
  console.log("window.Shopify.routes.root", window.Shopify.routes.root);

  const fetch = useAuthenticatedFetch();
  const handleClick = async () => {
    // const response = await fetch("/api/recommendations");
    console.log("window.Shopify.routes.root", window.Shopify.routes.root);
    var cartContents = await fetch(window.Shopify.routes.root + "cart.js")
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
    console.log("cartContents", cartContents);
  };

  return <Button onClick={handleClick}>Recommendations</Button>;
}

export default Setting;
