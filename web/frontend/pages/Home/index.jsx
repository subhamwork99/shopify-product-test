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
  List,
  Checkbox,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../../assets";

import { ProductsCard } from "../../components";
import "./index.css";
import { useAppQuery } from "../../hooks";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../../hooks";
import windowImage from "../../image/window-element.png";
import { Cart } from "@shopify/app-bridge/actions";
import widgetsimg from "../../image/widgetsimg.png";
export default function Home() {
  const [countProduct, setCountProduct] = useState("");
  // const [countOrder, setCountOrder] = useState("");
  const [shopData, setShopData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetsLoading, setIsWidgetsLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const fetch = useAuthenticatedFetch();
  const [analytics, setAnalytics] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({});

  useEffect(() => {
    handleProductsCount();
    handleShopData();
    // handleOrdersCount();
  }, []);


  useEffect(async () => {
    if (countProduct === 0) {
      await fetch("/api/addProducts");
      console.log("Add Product In DataBase");
    } else {
      console.log("Product Are More Then 0");
    }
  }, [countProduct]);

  // useEffect(async () => {
  //   countOrder === 0 ? await fetch("/api/addOrders") : null;
  // }, [countOrder]);

  const handleToggle = () => {
    setChecked(!checked);
  };

  const handleShopData = async () => {
    setIsLoading(true);
    await fetch("/api/userinformation")
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        setShopData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setShopData("");
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
  // const handleOrdersCount = async () => {
  //   await fetch("/api/orders/count")
  //     .then((res) => {
  //       return res.json();
  //     })
  //     .then(async (data) => {
  //       setCountOrder(data.count);
  //     });
  // };

  const handleChange = async (value) => {
    setIsWidgetsLoading(true);
    setAnalytics(value.target.checked);
    await fetch(
      `/api/add-related-theme/?recommendationsChange=${value.target.checked}`
    )
      .then((res) => {
        if (res.ok) {
          setToastContent({ content: "API Success", error: false });
        } else {
          setToastContent({ content: "API Error", error: true });
        }
        setShowToast(true);
      })
      .catch((err) => {
        setToastContent({ content: "API Error", error: true });
        setShowToast(true);
      });
    setIsWidgetsLoading(false);
  };

  useEffect(async () => {
    setIsWidgetsLoading(true);
    await fetch(`/api/theme-data-status`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setAnalytics(data.themeValueStatus);
      })
      .catch((err) => {
        setToastContent({ content: "API Error", error: true });
        setShowToast(true);
      });

    setIsWidgetsLoading(false);
  }, []);
  console.log(analytics);
  return (
    <div className="homeWrapper">
      <Page fullWidth>
        <Text as="h1" id="page-title">
          HOME
        </Text>
        <Layout>
          <Layout.Section>
            <div className="nameNavBar">
              <Card sectioned>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd" id="HelloText">
                    {isLoading ? (
                      <Spinner
                        accessibilityLabel="Spinner example"
                        size="small"
                      />
                    ) : shopData == "" ? (
                      "No Data Found"
                    ) : (
                      `👋 Hello, ${shopData?.res?.data[0]?.shop_owner}`
                    )}
                  </Text>
                </TextContainer>
              </Card>
            </div>
          </Layout.Section>
          <Layout.Section>
            <div className="question-div">
              <Card>
                <div>
                <Text id="question" fontWeight="medium">
                We are delighted to have you use Downtown: Shop & Discover app. Here are some of things to get you started:
                </Text>
                <Text id="question-option" fontWeight="medium">
                  - Product Recommendations Widget: Enhance your product details pages by showcasing similar products to help customers discover related items and make informed purchasing decisions.
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Customization Options: Tailor the appearance of the Product Recommendations widget to seamlessly integrate with your store's branding and design.
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Enable/Disable Feature: Easily enable or disable the Product Recommendations widget based on your preference and customer needs.
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Real-time Data: The widget fetches and displays up-to-date product recommendations to ensure relevance and accuracy.
                </Text>
                </div>
                <div id="mt-1">
                <Text id="question" fontWeight="medium">
                We are actively working on bringing new widgets and features that will help in better customer engagement and drive sales, some of them are:
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Frequently Bought Together Widget: Increase average order value and encourage cross-selling by suggesting products commonly purchased together.
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Trending Products Widget: Display popular and trending products to highlight items that are currently in high demand.
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Personalized Recommendations: Utilize customer behavior and preferences to offer personalized product recommendations for a unique shopping experience. 
                </Text>
                <Text id="question-option" fontWeight="medium">
                - Enhanced Customization: Further customize the appearance and layout of the widgets to align with your store's specific design requirements.
                </Text>
                </div>
                <Image source={windowImage} className="windowImage" />
              </Card>
            </div>
          </Layout.Section>
          <Layout.Section>
            <Text id="component-header">Active Widgets</Text>
            {isWidgetsLoading ? (
              <Spinner
                accessibilityLabel="Spinner example"
                size="large"
                hasFocusableParent={isWidgetsLoading}
              />
            ) : analytics ? (
              <div className="card-grid">
                <Card>
                  <Card.Section>
                    <div className="section-flex">
                      <Text id="recommendation">Product Recommendations</Text>
                      <section id="check-box">
                        <div className="card">
                          <div className="toggle">
                            <input
                              type="checkbox"
                              id="check-1"
                              checked={analytics}
                              onChange={handleChange}
                            />
                            <label htmlFor="check-1" />
                          </div>
                        </div>
                      </section>
                    </div>
                  </Card.Section>
                  <Card.Section>
                    <Text id="recommendation-text">
                    Discover related products and make informed purchasing decisions with personalized recommendations.
                    </Text>
                  </Card.Section>
                </Card>
              </div>
            ) : (
              <div className="active-widgets">
                <Card>
                  <div className="widgetsimg">
                    <Image source={widgetsimg} />
                  </div>
                  <Text id="widgets-header" fontWeight="medium" as="h1">
                    This is where you’ll manage your active widgets
                  </Text>
                  <Text id="widgets-text">
                    You can set up and enable recommendations from your widgets
                    page.
                  </Text>
                </Card>
              </div>
            )}
          </Layout.Section>
        </Layout>
      </Page>
      {showToast && (
        <Toast
          error={toastContent.error}
          content={toastContent.content}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
