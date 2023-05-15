import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  Spinner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

import { useAppQuery } from "../hooks";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../hooks";

export default function Home() {
  const [countProduct, setCountProduct] = useState("");
  const [countOrder, setCountOrder] = useState("");
  const [shopData, setShopData] = useState("");
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    handleProductsCount();
    handleShopData();
    handleOrdersCount();
  }, []);

  useEffect(async () => {
    if (countProduct === 0) {
      await fetch("/api/addProducts");
      console.log("Add Product In DataBase");
    } else {
      console.log("Product Are More Then 0");
    }
  }, [countProduct]);

  useEffect(async () => {
    if (countOrder === 0) {
      await fetch("/api/addOrders");
      console.log("Add Order In DataBase");
    } else {
      console.log("Order Are More Then 0");
    }
  }, [countOrder]);

  const handleShopData = async () => {
    await fetch("/api/userinformation")
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        setShopData(data);
      });
  };
  const handleProductsCount = async () => {
    await fetch("/api/products/count")
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        setCountProduct(data.count);
      });
  };
  const handleOrdersCount = async () => {
    await fetch("/api/orders/count")
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        setCountOrder(data.count);
      });
  };
  
  return (
    <Page narrowWidth>
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd">
                    {shopData == "" ? (
                      <Spinner
                        accessibilityLabel="Spinner example"
                        size="small"
                      />
                    ) : (
                      `Hello ${shopData?.res?.data[0]?.shop_owner} 🎉`
                    )}
                  </Text>
                </TextContainer>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
