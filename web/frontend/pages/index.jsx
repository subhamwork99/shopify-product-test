// import { ActionList, AppProvider, Frame, Navigation } from "@shopify/polaris";
// import { HomeMinor, OrdersMinor, ProductsMinor } from "@shopify/polaris-icons";
// import React from "react";
// import Routes from "./../Routes";
// import AppFrame from "./Routing/AppFrame";
// import { BrowserRouter } from "react-router-dom";
// import ReactDOM from "react-dom";

// export default function HomePage({children}) {
//   console.log("children",children);
//   // const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
//   // const pages = "hii"

//   return (

//       <AppProvider  i18n={{
//           Polaris: {
//             Avatar: {
//               label: 'Avatar',
//               labelWithInitials: 'Avatar with initials {initials}',
//             },
//             ContextualSaveBar: {
//               save: 'Save',
//               discard: 'Discard',
//             },
//             TextField: {
//               characterCount: '{count} characters',
//             },
//             TopBar: {
//               toggleMenuLabel: 'Toggle menu',

//               SearchField: {
//                 clearButtonLabel: 'Clear',
//                 search: 'Search',
//               },
//             },
//             Modal: {
//               iFrameTitle: 'body markup',
//             },
//             Frame: {
//               skipToContent: 'Skip to content',
//               navigationLabel: 'Navigation',
//               Navigation: {
//                 closeMobileNavigationLabel: 'Close navigation',
//               },
//             },
//           },
//         }}>
//         <AppFrame />
//       </AppProvider>
//   );
// }

// if(document.getElementById("root")){
//   ReactDOM.render(<HomePage/>,document.getElementById("root"))

// }

import { ActionList, Frame, Navigation, Modal, AppProvider, Loading, FormLayout } from "@shopify/polaris";
import { HomeMinor, OrdersMinor, ProductsMinor, SettingsMajor } from "@shopify/polaris-icons";
import React, { useState, useCallback, useEffect } from "react";
import Routes from "./../Routes";
import { Route } from "react-router-dom";
import Home from './Home';
import Products from "./products";
import Order from "./order";
import Setting from "./setting";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";



// export default function HomePage({ children }) {
//   const [modalActive, setModalActive] = useState(false);
//   const [homePage, setHome]=useState(false);
//   const [productPage ,setProductPage] = useState(false)
//   const [orderPage ,setOrderPage] = useState(false)
//   // console.log("children",children);
//   // const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
//   // const pages = import Home from './Home';

//   const toggleModalActive = useCallback(
//     () => setModalActive((modalActive) => !modalActive),
//     []
//   );

//   const homePageOpen = useCallback(
//     () => setHome((homePage) => !homePage),
//     []
//   );

  
//   const orderPageOpen = useCallback(
//     () => setOrderPage((orderPage) => !orderPage),
//     []
//   );

//   const productPageOpen = useCallback(
//     () => setProductPage((productPage) => !productPage),
//     []
//   );

  
//   const homePageMarkup = homePage ? <Home /> :"";
//   const orderPageMarkup = orderPage ? <Order /> : "";
//   const productPageMarkup = productPage ? <Products /> : "";

  

//   const navigationMarkup = (
//     <Navigation location="/">
//       <Navigation.Section
//         items={[
//           {
//             // url: "/Home",
//             excludePaths: ["#"],
//             label: "Home",
//             icon: HomeMinor,
//             onClick:homePageOpen
//           },
//           {
//             // url: "#",
//             excludePaths: ["#"],
//             label: "Orders",
//             icon: OrdersMinor,
//             badge: "15",
//             onClick: orderPageOpen
//           },
//           {
//             // url: "/products",
//             excludePaths: ["#"],
//             label: "Products",
//             icon: ProductsMinor,
//             onClick: productPageOpen
//           },
//         ]}
//         action={{
//           // icon: ConversationMinor,
//           accessibilityLabel: "Contact support",
//           onClick: toggleModalActive,
//         }}
//       />

//       {/* <Routes pages={pages} /> */}
//     </Navigation>
//   );

  

  

//   return (
//     <div style={{height: '500px'}}>
//     <AppProvider
//       i18n={{
//         // Polaris: {
//         //   Avatar: {
//         //     label: "Avatar",
//         //     labelWithInitials: "Avatar with initials {initials}",
//         //   },
//         //   ContextualSaveBar: {
//         //     save: "Save",
//         //     discard: "Discard",
//         //   },
//         //   TextField: {
//         //     characterCount: "{count} characters",
//         //   },
//         //   TopBar: {
//         //     toggleMenuLabel: "Toggle menu",

//         //     SearchField: {
//         //       clearButtonLabel: "Clear",
//         //       search: "Search",
//         //     },
//         //   },
//         //   Modal: {
//         //     iFrameTitle: "body markup",
//         //   },
//         //   Frame: {
//         //     skipToContent: "Skip to content",
//         //     navigationLabel: "Navigation",
//         //     Navigation: {
//         //       closeMobileNavigationLabel: "Close navigation",
//         //     },
//         //   },
//         // },
//       }}
//     >
//       <Frame navigation={navigationMarkup}>
//         {homePageMarkup}
//         {productPageMarkup}
//         {orderPageMarkup}
//         {/* <Navigation location="/">
//         <Navigation.Section
//           items={[
//             {
//               url: "/home",
//               label: "Home",
//               icon: HomeMinor,
//             },
//             {
//               url: "#",
//               excludePaths: ["#"],
//               label: "Orders",
//               icon: OrdersMinor,
//               badge: "15",
//             },
//             {
//               url: "/products",
//               excludePaths: ["#"],
//               label: "Products",
//               icon: ProductsMinor,
//             },
//           ]}
//           // action={{
//           //   // icon: ConversationMinor,
//           //   accessibilityLabel: "Contact support",
//           //   onClick: toggleModalActive
//           // }}
//         />

//             {/* <Routes pages={pages} /> */}
//         {/* </Navigation> */}
//       </Frame>
//     </AppProvider>
//     </div>
//   );
// }


export default function HomePage({ children }) {
  const [modalActive, setModalActive] = useState(false);
  const [homePage, setHome]=useState(false);
  const [productPage ,setProductPage] = useState(false)
  const [orderCount ,setOrderCount ] = useState("")
  // console.log("children",children);
  // const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  // const pages = import Home from './Home';

  const [selectedTab, setSelectedTab] = useState('home');
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const fetch = useAuthenticatedFetch();


  const toggleNavigation = useCallback(
    () => setIsNavigationOpen((isNavigationOpen) => !isNavigationOpen),
    [],
  );


  
  const toggleTab = useCallback((tab) => setSelectedTab(tab), []);

  useEffect(()=>{
    handleOrders()
  },[])
  
  // useAppQuery({
  //   url: "/api/orders/count",
  //   reactQueryOptions: {
  //     onSuccess: (reponseData) => {
  //       console.log("reponseData", reponseData);
  //       setOrderCount(reponseData);
  //     },
  //   },
  // });
  // console.log("productData", productData);

  const handleOrders = async() =>{
    const responseOrderApi = await fetch("/api/orders/count").then((res)=>{
    })

    await fetch("/api/orders/count")
    .then((res)=>{return res.json()}).then(data => setOrderCount(data.count))
  }

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            // url: "/Home",
            excludePaths: ["#"],
            label: "Home",
            icon: HomeMinor,
            selected: selectedTab === 'home',
            onClick: () => toggleTab('home'),
          },
          {
            // url: "#",
            excludePaths: ["#"],
            label: "Orders",
            icon: OrdersMinor,
            badge: orderCount,
            selected: selectedTab === 'orders',
            onClick: () => toggleTab('orders'),
          },
          {
            // url: "/products",
            excludePaths: ["#"],
            label: "Products",
            icon: ProductsMinor,
            selected: selectedTab === 'products',
            onClick: () => toggleTab('products'),
          },
          {
            
            // url: "/products",
            excludePaths: ["#"],
            label: "Setting",
            icon: SettingsMajor,
            selected: selectedTab === 'setting',
            onClick: () => toggleTab('setting'),
          },
        ]}
        action={{
          // icon: <Icon source={HomeMajor} />,
          accessibilityLabel: 'Home',
          onClick: () => toggleTab('home'),
        }}
      />

      {/* <Routes pages={pages} /> */}
    </Navigation>
  );

  
  const renderPage = () => {
    switch (selectedTab) {
      case 'home':
        return <Home />;
      case 'orders':
        return <Order />;
      case 'products':
        return <Products />;
      case 'setting':
        return <Setting/>;
      default:
        return <Home />;
    }
  };
  

  return (
    <div style={{height: '500px'}}>
    <AppProvider
      i18n={{
        // Polaris: {
        //   Avatar: {
        //     label: "Avatar",
        //     labelWithInitials: "Avatar with initials {initials}",
        //   },
        //   ContextualSaveBar: {
        //     save: "Save",
        //     discard: "Discard",
        //   },
        //   TextField: {
        //     characterCount: "{count} characters",
        //   },
        //   TopBar: {
        //     toggleMenuLabel: "Toggle menu",

        //     SearchField: {
        //       clearButtonLabel: "Clear",
        //       search: "Search",
        //     },
        //   },
        //   Modal: {
        //     iFrameTitle: "body markup",
        //   },
        //   Frame: {
        //     skipToContent: "Skip to content",
        //     navigationLabel: "Navigation",
        //     Navigation: {
        //       closeMobileNavigationLabel: "Close navigation",
        //     },
        //   },
        // },
      }}
    >
      <Frame navigation={navigationMarkup}>
        {renderPage()}
      </Frame>
    </AppProvider>
    </div>
  );
}