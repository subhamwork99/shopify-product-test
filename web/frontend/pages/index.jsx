import { Frame, Navigation, AppProvider, Thumbnail } from "@shopify/polaris";
import {
  HomeMinor,
  OrdersMinor,
  ProductsMinor,
  SettingsMajor,
  AnalyticsMinor,
} from "@shopify/polaris-icons";
import React, { useState, useCallback, useEffect } from "react";
import Routes from "./../Routes";
import { Route } from "react-router-dom";
import Home from "./Home/Home";
import Products from "./products";
import Order from "./order";
import Analytics from "./Analytics";
import Widgets from "./Widgets/index";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import "./index.css";
import logoImage from "../image/Downtown-Logo.png";
// import widgetsIcon from "../image/widgets.svg";
import WidgetIcon from "../image/widgets.svg";
export default function HomePage({ children }) {
  const [orderCount, setOrderCount] = useState("");
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
  // const logo = {
  //   width: 124,
  //   topBarSource: "../image/Downtown-Logo.png",
  //   url: "#",
  //   accessibilityLabel: "Jaded Pixel",
  // };
  const CustomIcon = () => (
    <div className="navIcon">
      <svg
        width="14"
        height="15"
        viewBox="0 0 14 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 14.5C0.89543 14.5 -3.91405e-08 13.6046 -8.74228e-08 12.5L-2.62268e-07 8.5L6 8.5L6 14.5L2 14.5Z"
          fill="--p-color-icon"
        />
        <path
          d="M8 14.5L8 8.5L14 8.5L14 12.5C14 13.6046 13.1046 14.5 12 14.5L8 14.5Z"
          fill="--p-color-icon"
        />
        <path
          d="M-5.24537e-07 2.5L-3.49691e-07 6.5L6 6.5L6 0.5L2 0.5C0.89543 0.5 -5.72819e-07 1.39543 -5.24537e-07 2.5Z"
          fill="--p-color-icon"
        />
        <path
          d="M8 3.5C8 2.94771 8.44771 2.5 9 2.5L10 2.5L10 1.5C10 0.947714 10.4477 0.5 11 0.5C11.5523 0.499999 12 0.947715 12 1.5L12 2.5L13 2.5C13.5523 2.5 14 2.94771 14 3.5C14 4.05228 13.5523 4.5 13 4.5L12 4.5L12 5.5C12 6.05228 11.5523 6.5 11 6.5C10.4477 6.5 10 6.05228 10 5.5L10 4.5L9 4.5C8.44771 4.5 8 4.05228 8 3.5Z"
          fill="--p-color-icon"
        />
      </svg>
    </div>
  );
  const navigationMarkup = (
    <div className="sideBar">
      <Navigation location="/">
        <div className="navLogo">
          <Thumbnail source={logoImage} alt="logo" />
        </div>
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
              label: "Widgets",
              icon: CustomIcon,
              selected: selectedTab === "Widgets",
              onClick: () => toggleTab("Widgets"),
            },
            {
              // url: "/products",
              excludePaths: ["#"],
              label: "Analytics",
              icon: AnalyticsMinor,
              selected: selectedTab === "Analytics",
              onClick: () => toggleTab("Analytics"),
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
    </div>
  );

  const renderPage = () => {
    switch (selectedTab) {
      case "home":
        return <Home />;
      case "orders":
        return <Order />;
      case "products":
        return <Products />;
      case "Analytics":
        return <Analytics />;
      case "Widgets":
        return <Widgets />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ height: "500px" }}>
      <AppProvider i18n={{}}>
        <Frame navigation={navigationMarkup} showNavigationToggle={isNavigationOpen}>{renderPage()}</Frame>
      </AppProvider>
    </div>
  );
}
