import React, { useEffect, useState } from "react";
import { useAppQuery } from "../hooks";
import { Page, LegacyCard, DataTable } from "@shopify/polaris";

function Products() {
  const [productData, setProductData] = useState([]);

  useAppQuery({
    url: "/api/products",
    reactQueryOptions: {
      onSuccess: (reponseData) => {
        setProductData(reponseData);
      },
    },
  });

  console.log("productData", productData);

  const rows = productData?.map(({ title, status, vendor }) => {
    return [[title, status, vendor]];
  });
  console.log("rowsTemp", rows)
  // const rows = [['Emerald Silk Gown', '$875.00', '$122,500.00']]
  // console.log("rows", rows);
  // const rowCountIsEven = Array.isArray(rows) && rows.length % 2 === 0;

  return (
    <Page title="Sales by product">
      <LegacyCard>
        {rows && rows.length > 0 && (
          <DataTable
            columnContentTypes={["text", "text", "text"]}
            headings={["Title", "status", "vendor"]}
            rows={rows}
            // footerContent={
            //   rowCountIsEven ? "Number of Products: Even" : "Number of Products: Odd"
            // }
          />
        )}
      </LegacyCard>
    </Page>
  );
}

export default Products;
