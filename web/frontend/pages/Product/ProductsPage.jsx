import React, { useCallback, useEffect, useState } from "react";
import { useAppQuery } from "../../hooks";
import {
  Page,
  LegacyCard,
  DataTable,
  Pagination,
  Thumbnail,
  Button,
  Spinner,
  IndexTable,
  useIndexResourceState,
  Image,
  Text,
  Tabs,
  IndexFilters,
  Tooltip,
} from "@shopify/polaris";
import { Icon } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../hooks";
import {
  CircleInformationMajor
} from '@shopify/polaris-icons';
function ProductsPage({setSelectedProducts , selectedProducts}) {
  console.log("selectedProducts",selectedProducts);
  const fetch = useAuthenticatedFetch();
  const [pageNumber, setPageNumber] = useState(1);
  const [productData, setProductData] = useState([]);
  // const [relatedProducts, setRelatedProducts] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [isOptimizing,setIsOptimizing] = useState(false);
  const [selected, setSelected] = useState(0);
  const resourceName = {
    singular: "order",
    plural: "orders",
  };
  const tabs = [
    {
      id: "all-customers-1",
      content: "All",
    },
  ];

  useEffect(() => {
    getData();
  }, [pageNumber]);
  // const getRelatedProducts = async () => {
  //   await fetch(
  //     `https://shopify-product-test-2.onrender.com/related-product/?productName=${""}`
  //   )
  //     .then((response) => response.json())
  //     .then((products) => {
  //       setRelatedProducts(products);
  //     });
  // };
  const getData = async () => {
    setTableLoader(true);
    await fetch(`/api/products/?pageNumber=${pageNumber}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          const newObject = {
            products: data?.products?.map((product) => {
              const { _id, ...rest } = product;
              return { id: _id, ...rest };
            }),
            productCount: data?.productCount, 
          };
          setProductData(newObject);
          setTableLoader(false);
          setIsOptimizing(data?.shop_optimization)
          // getRelatedProducts();
        } else {
          console.error('Invalid data format:', data);
        }
      })
      .catch((err) => {
        setProductData([]);
        setTableLoader(false);
      });
    };
    const rows = productData?.products?.map((value) => {
      return [
        <div className="related-product-row">
        <div className="table-row" onClick={()=>{setSelectedProducts(value)}}>
        <td className="row-cell-1" >
        <Thumbnail source={value?.images[0]?.src} alt={value?.title} />
         </td>
           <td className="row-cell-2">{value?.title}</td>
            <td id="related-flex" className="row-cell-3">
        { value?.related_product?.map((product) => (
        <td key={product?.images[0]?.id} >
          <Thumbnail
            source={product?.images[0]?.src}
            alt={product?.title}
            style={{ width: "50px", height: "auto", marginRight: "10px" }}
          />
        </td>
      ))}
    </td>
            {
              isOptimizing ?
              <div className="optimization">
                <td className="optimizing-td">
                  optimizing
                </td>
                <td  className="viewMajor">
                    <Tooltip content="Our system is generating intelligence for similar products. Once it's ready this flag will go-away.">
                      <Icon source={CircleInformationMajor} color="base" />
                    </Tooltip>
                </td>
                </div>
                : null
            }
        </div>
        </div>
  ];
});


  const AddProduct = async () => {
    setTableLoader(true);
    await fetch("/api/addProducts");
    if (pageNumber === 1) {
      getData();
    } else {
      setPageNumber(1);
    }
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(productData?.products);
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );

    const updateCatlog = async()=>{
    setTableLoader(true);
    await fetch("/api/updateCatlog").then((res)=>{
      getData();
    })
    }

  const rowMarkup = productData?.products?.map(
    (value, index) => (
      <IndexTable.Row
        id={value?.id}
        key={value?.id}
        selected={selectedResources?.includes(value?.id)}
        position={index}
        onClick={()=>{setSelectedProducts(value)}}
      >
        <IndexTable.Cell>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image
              alt={value?.title}
              source={value?.images[0]?.src}
              style={{ width: "50px", height: "auto" }}
            />
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell className="title-cell">
          <span>{value?.title}</span>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {value?.related_product?.map((products) => (
            <Image
              key={products?.images[0]?.id}
              alt={products?.title}
              source={products?.images[0]?.src}
              style={{ width: "50px", height: "auto", marginRight: "10px" }}
            />
          ))}
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );
  return (
    <>
      <Page fullWidth>
        <div className="div-flex">
        <Text as="h1" id="page-title">
          Products
        </Text>
        <div className="update-catlog"> 
      <Button onClick={updateCatlog}>
        Update Catlog
      </Button>
        </div>
        </div>
        {/* <div
        style={{ display: "flex", justifyContent: "end", marginBottom: "1rem" }}
      >
        <Button onClick={AddProduct}>Refresh Product</Button>
      </div> */}
        <div className="tableWrapper">
          <LegacyCard>
            {/* <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}> */}
            {/* <IndexFilters className="custom-index-filter" tabs={tabs} />   */}
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
            ) : productData?.length == 0 ? (
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
              // selected ==0 ?

              <>
                <DataTable
                  columnContentTypes={[ "", "Product", "Recommended products"]}
                  headings={[<div className="table-row">
                    <div className="row-cell-1">
                      
                    </div>
                    <div className="row-cell-2">
                    Product
                    </div>
                    <div className="row-cell-3">
                    Recommended products
                    </div>
                  </div>]}
                  rows={rows}
               ></DataTable>
                {/* <IndexTable
                  resourceName={resourceName}
                  itemCount={productData?.products?.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    {},
                    { title: "Product" },
                    { title: "Recommended products" },
                  ]}
                >
                  {rowMarkup}
                </IndexTable> */}
              </>

              // : selected ==1 ?
              // <p>Tab 1 selected</p>
              // :null
            )}
            {/* </Tabs> */}
            <div className="Pagination-btn">
              <Pagination
                hasPrevious
                onPrevious={() => {
                  if (pageNumber !== 1) {
                    setPageNumber(pageNumber - 1);
                  }
                }}
                hasNext
                onNext={() => {
                  if (
                    Math.ceil(productData?.productCount / 20) > pageNumber
                  ) {
                    setPageNumber(pageNumber + 1);
                  }
                }}
              />
            </div>
          </LegacyCard>
        </div>
      </Page>
    </>
  );
}

export default ProductsPage;
