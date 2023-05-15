import React, { useCallback, useEffect, useState } from "react";
import { useAppQuery } from "../hooks";
import {
  Page,
  LegacyCard,
  DataTable,
  Pagination,
  Thumbnail,
  Button,
  Spinner,
  Toast,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";
import { } from 'dotenv/config'
function Products() {
  const fetch = useAuthenticatedFetch();
  const [pageNumber, setPageNumber] = useState(1);
  const [productData, setProductData] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);

  let limit = process.env.PRODUCT_LIST_LIMIT;
  useEffect(() => {
    getData();
  }, [pageNumber]);

  const getData = async () => {
    setTableLoader(true);
    await fetch(`/api/products/?pageNumber=${pageNumber}&limit=${limit}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setProductData(data);
        setTableLoader(false);
      })
      .catch((err) => {
        setProductData([]);
        setTableLoader(true);
      });
  };

  const rows = productData?.products?.map(
    ({ title, status, vendor, images }) => {
      return [
        <div>
          <Thumbnail source={images[0].src} alt={title} />
        </div>,
        title,
        status,
        vendor,
      ];
    }
  );
  const AddProduct = async () => {
    setTableLoader(true);
    await fetch("/api/addProducts");
    if (pageNumber === 1) {
      getData();
    } else {
      setPageNumber(1);
    }
  };
  return (
    <Page>
      <div
        style={{ display: "flex", justifyContent: "end", marginBottom: "1rem" }}
      >
        <Button onClick={AddProduct}>Refresh Product</Button>
      </div>
      <LegacyCard>
        {tableLoader ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem 0",
            }}
          >
            <Spinner accessibilityLabel="Spinner example" size="large" />
          </div>
        ) : (
          <>
            <DataTable
              columnContentTypes={["Image", "text", "text", "text"]}
              headings={["Image", "Title", "status", "vendor"]}
              rows={rows}
            />
          </>
        )}
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Pagination
            hasPrevious
            onPrevious={() => {
              if (pageNumber !== 1) {
                setPageNumber(pageNumber - 1);
              }
            }}
            hasNext
            onNext={() => {
              if (Math.ceil(productData?.productCount / limit) > pageNumber) {
                setPageNumber(pageNumber + 1);
              }
            }}
          />
        </div>
      </LegacyCard>
    </Page>
  );
}

export default Products;
