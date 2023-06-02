import React, { useEffect, useState, useCallback } from "react";
import {
  Page,
  LegacyCard,
  Image,
  Card,
  Text,
  TextField,
  Button,
  DataTable,
  Thumbnail,
} from "@shopify/polaris";

function SelectedProduct({ setSelectedProducts, selectedProducts }) {
  const [search, setSearch] = useState("");

  const handleBackAction = () => {
    setSelectedProducts({});
  };
  
  const rows = selectedProducts.related_product?.map(
    (value,index) => {
      return [
        `${index +1}`,
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image
              alt={value.title}
              source={value.images[0]?.src}
              style={{ width: "50px", height: "auto" }}
            />
          </div>
        </div>,
        <div>
          <div style={{color:'#2C6ECB'}}>{value.title}</div>
          <div>&#8377;{value.variants[0]?.price}</div>
        </div>
      ];
    })
  return (
    <Page
      backAction={{ content: "Products", onAction: handleBackAction }}
      title="Edit Product Recommendation"
      fullWidth
    >
      <LegacyCard sectioned>
        <Text id="product-header">Product</Text>
        <div className="Selected-product-img">
          <Card>
            <Image
              source={selectedProducts?.images[0].src}
              style={{ width: "100%", height: "100%" }}
            />
          </Card>
          <div className="Selected-product-text">
            <Text>
              <span style={{ fontSize: "18px" }}>
                {selectedProducts?.title}{" "}
              </span>
            </Text>
            <Text>
              Id: <span>{selectedProducts?.id}</span>
            </Text>
            <Text>
              Price: <span>{selectedProducts?.variants[0].price}</span>
            </Text>
            <Text>
              Product Type: <span>{selectedProducts?.product_type}</span>
            </Text>
          </div>
        </div>
      </LegacyCard>

      <LegacyCard sectioned>
        <div className="related-product-Wrapper">
        <Text id="related-product">Related Products</Text>
        <DataTable
          headings={[]}
          columnContentTypes={["text", "Image", "text"]}
          rows={rows}
        />
        </div>
      </LegacyCard>
    </Page>
  );
}

export default SelectedProduct;
