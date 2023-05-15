import { Frame, Navigation, AppProvider } from "@shopify/polaris";
import {
  HomeMinor,
  OrdersMinor,
  ProductsMinor,
  SettingsMajor,
} from "@shopify/polaris-icons";
import React, { useState, useCallback, useEffect } from "react";
import Routes from "./../Routes";
import { Route } from "react-router-dom";
import Home from "./Home";
import Products from "./products";
import Order from "./order";
import Recommendations from "./Recommendations";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default function HomePage({ children }) {
  const [orderCount, setOrderCount] = useState("");
  // console.log("children",children);
  // const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  // const pages = import Home from './Home';

  const [selectedTab, setSelectedTab] = useState("home");
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const fetch = useAuthenticatedFetch();
  const toggleNavigation = useCallback(
    () => setIsNavigationOpen((isNavigationOpen) => !isNavigationOpen),
    []
  );
  const toggleTab = useCallback((tab) => setSelectedTab(tab), []);
  useEffect(() => {
    handleOrders();
  }, []);

  const handleOrders = async () => {
    await fetch("/api/orders/count")
      .then((res) => {
        return res.json();
      })
      .then((data) => setOrderCount(data.count));
  };

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            // url: "/Home",
            excludePaths: ["#"],
            label: "Home",
            icon: HomeMinor,
            selected: selectedTab === "home",
            onClick: () => toggleTab("home"),
          },
          {
            // url: "#",
            excludePaths: ["#"],
            label: "Orders",
            icon: OrdersMinor,
            badge: orderCount,
            selected: selectedTab === "orders",
            onClick: () => toggleTab("orders"),
          },
          {
            // url: "/products",
            excludePaths: ["#"],
            label: "Products",
            icon: ProductsMinor,
            selected: selectedTab === "products",
            onClick: () => toggleTab("products"),
          },
          {
            // url: "/products",
            excludePaths: ["#"],
            label: "Recommendations",
            icon: SettingsMajor,
            selected: selectedTab === "Recommendations",
            onClick: () => toggleTab("Recommendations"),
          },
        ]}
        action={{
          // icon: <Icon source={HomeMajor} />,
          accessibilityLabel: "Home",
          onClick: () => toggleTab("home"),
        }}
      />

      {/* <Routes pages={pages} /> */}
    </Navigation>
  );

  const renderPage = () => {
    switch (selectedTab) {
      case "home":
        return <Home />;
      case "orders":
        return <Order />;
      case "products":
        return <Products />;
      case "Recommendations":
        return <Recommendations />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ height: "500px" }}>
      <AppProvider i18n={{}}>
        <Frame navigation={navigationMarkup}>{renderPage()}</Frame>
      </AppProvider>
    </div>
  );
}
