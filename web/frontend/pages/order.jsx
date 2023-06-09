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
function Order() {
  const fetch = useAuthenticatedFetch();
  const [pageNumber, setPageNumber] = useState(1);
  const [orderData, setOrderData] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);

  let limit = 5;
  useEffect(() => {
    getData();
  }, [pageNumber]);

  const getData = async () => {
    setTableLoader(true);
    await fetch(`/api/order/?pageNumber=${pageNumber}&limit=${limit}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setOrderData(data);
        setTableLoader(false);
      })
      .catch((err) => {
        setOrderData([]);
        setTableLoader(false);
      });
  };

  const rows = orderData?.orders?.map(
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
  const AddOrder = async () => {
    setTableLoader(true);
    await fetch("/api/addOrders");
    if (pageNumber === 1) {
      getData();
    } else {
      setPageNumber(1);
    }
    setActive(true);
  };
  return (
    <Page>
      <div
        style={{ display: "flex", justifyContent: "end", marginBottom: "1rem" }}
      >
        {/* <Button onClick={AddOrder}>Refresh Order</Button> */}
      </div>
      <LegacyCard>
        {/* {tableLoader && rows && rows.length > 0 && tableLoader( */}
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
        ) : orderData?.length == 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem 0",
            }}
          >
            No Data Found
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
              if (Math.ceil(orderData?.orderCount / limit) > pageNumber) {
                setPageNumber(pageNumber + 1);
              }
            }}
          />
        </div>
      </LegacyCard>
    </Page>
  );
}

export default Order;
