import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    Stack,
    Link,
    Text,
  } from "@shopify/polaris";
  import { TitleBar } from "@shopify/app-bridge-react";
  
  import { trophyImage } from "../assets";
  
  import { ProductsCard } from "../components";
  
  export default function Home() {
    return (
      <Page narrowWidth>
        <TitleBar title="Home123" primaryAction={null} />
 
      </Page>
    );
  }
  