import { Frame, Navigation, AppProvider, Thumbnail,TopBar } from "@shopify/polaris";
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
import Home from "./Home";
import Products from "./Product";
import Order from "./order";
import Analytics from "./Analytics";
import Widgets from "./Widgets/index";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import "./index.css";
import logoImage from "../image/Downtown-Logo.png";
import WidgetsIcon from "../svgIcon/WidgetsIcon"
import AnalyticsIcon from "../svgIcon/AnalyticsIcon";
import HomeIcon from "../svgIcon/HomeIcon";
import ProductsIcon from "../svgIcon/ProductsIcon";
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
              icon: HomeIcon,
              selected: selectedTab === "home",
              onClick: () => toggleTab("home"),
            },
            // {
            //   // url: "#",
            //   excludePaths: ["#"],
            //   label: "Orders",
            //   icon: OrdersMinor,
            //   disabled:true,
            //   badge: orderCount,
            //   selected: selectedTab === "orders",
            //   onClick: () => toggleTab("orders"),
            // },
            {
              // url: "/products",
              excludePaths: ["#"],
              label: "Products",
              icon: ProductsIcon,
              selected: selectedTab === "products",
              onClick: () => toggleTab("products"),
            },
            {
              // url: "/products",
              excludePaths: ["#"],
              label: "Widgets",
              icon: WidgetsIcon,
              selected: selectedTab === "Widgets",
              onClick: () => toggleTab("Widgets"),
            },
            // {
            //   // url: "/products",
            //   excludePaths: ["#"],
            //   label: "Analytics",
            //   icon: AnalyticsMinor,
            //   selected: selectedTab === "Analytics",
            //   onClick: () => toggleTab("Analytics"),
            // },
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
      // case "Analytics":
      //   return <Analytics />;
      case "Widgets":
        return <Widgets />;
      default:
        return <Home />;
    }
  };

  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigationActive = useCallback(
    () =>
      setMobileNavigationActive(
        (mobileNavigationActive) => !mobileNavigationActive
      ),
    []
  );


  return (
    <div style={{ height: "500px" }}>
      <AppProvider i18n={{}}>
        <Frame navigation={navigationMarkup} 
        showNavigationToggle={isNavigationOpen}
        showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={toggleMobileNavigationActive}
        >
           <TopBar
            showNavigationToggle
            onNavigationToggle={toggleMobileNavigationActive}
          />
          {renderPage()}</Frame>
      </AppProvider>
    </div>
  );
}

