import React from "react";
import { Button } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

function Setting() {
  const fetch = useAuthenticatedFetch();
  const handleClick = async () => {
    const responseApi = await fetch("/api/recommendations");
    console.log("responseApi", responseApi);
  };

  return (
    <>
      <Button onClick={handleClick}>Recommendations</Button>
    </>
  );
}

export default Setting;
