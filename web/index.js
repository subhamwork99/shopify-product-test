// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
// const cors = require("cors")
import cors from "cors"
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

import Mongoose from "mongoose"
import Request from 'request';
import fs from 'fs';
import { } from 'dotenv/config'

// const https = require('https')
const app = express();
app.use(express.json())
app.use(cors())
// Mongoose.connect("mongodb://localhost:27017/downtown-shopify-test");
Mongoose.connect(`${process.env.MONGODB_CONNECT}`)
  .then((res) => console.log("database connected"))
  .catch((error) => console.log("error", error))

// Product Schema
const productSchema = new Mongoose.Schema({
  title: { type: String }
}, { strict: false });
const Product = Mongoose.model("products", productSchema);

//Order Schema
const orderSchema = new Mongoose.Schema({}, { strict: false });
const Order = Mongoose.model("orders", orderSchema);

// const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const PORT = 8081;
// console.log("PORT", PORT);


const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;



// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/orders/count", async (_req, res) => {
  try {
    const orderResponse = await shopify.api.rest.Order.count({
      session: res.locals.shopify.session,
      status: "any"
    });
    res.status(200).send(orderResponse);
  } catch (error) {
    // console.log("error::", error)
    res.status(500).send(error);
  }
});

// app.get("/api/addProducts", async (_req, res) => {
//   const productDataAll = await shopify.api.rest.Product.all({
//     session: res.locals.shopify.session,
//   })
//   try {
//     await Product.deleteMany({})
//     const insertResponse = await Product.insertMany(productDataAll.data)
//     res.status(200).send(insertResponse);
//   } catch (error) {
//     // console.log("error", error)
//     res.status(500).send(error);
//   }
// });

app.get("/api/addProducts", async (_req, res) => {
  try {
    const productDataAll = await shopify.api.rest.Product.all({
      session: res.locals.shopify.session,
    });
    
    await Product.deleteMany({});
    
    const newObject = await Promise.all(productDataAll.data.map(async (product) => {
      const relatedProduct = [];
      
      for (const subProduct of productDataAll.data) {
        if (relatedProduct.length === 5) {
          break; // Break the loop if 5 related products are already added
        }
        
        if (subProduct.title !== product.title) {
          relatedProduct.push(subProduct);
        }
      }
      
      return { related_product: relatedProduct, ...product };
    }));
    
    const insertResponse = await Product.insertMany(newObject);
    res.status(200).send(newObject);
  } catch (error) {
    res.status(500).send(error);
  }
});



app.get("/api/addOrders", async (_req, res) => {
  const orderAll = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
  })
  try {
    await Order.deleteMany({})
    const insertResponse = await Order.insertMany(orderAll.data)
    res.status(200).send(insertResponse);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/products", async (_req, res) => {
  let page = parseInt(_req.query.pageNumber)
  let limit = process.env.PRODUCT_LIST_LIMIT;
  let skip = (page - 1) * limit;
  const productDataAll = await Product.find({}, {}, { skip: skip, limit: limit });
  const productCount = await Product.count({});
  res.status(200).send({ products: productDataAll, productCount: productCount });
})

app.get("/api/orders", async (_req, res) => {
  let page = parseInt(_req.query.pageNumber)
  let limit = process.env.PRODUCT_LIST_LIMIT;
  let skip = (page - 1) * limit;
  const orderDataAll = await Order.find({}, {}, { skip: skip, limit: limit });
  const orderCount = await Order.count({});
  res.status(200).send({ orders: orderDataAll, orderCount: orderCount });
})

app.get("/api/add-related-theme", async (_req, res) => {

  let recommendationsChange = _req.query.recommendationsChange

  fs.readFile('./theme-assets.html', 'utf8', function (err, HtmlData) {
    const data = {
      asset: {
        key: `${process.env.RELATED_PRODUCTS}`,
        value: (recommendationsChange === 'true') ? ` ${HtmlData} ` : null
      }
    };
    

    const options = {
      method: 'PUT',
      url: `${process.env.THEME_URL}`,
      headers: {
        'X-Shopify-Access-Token': res.locals.shopify.session.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    Request(options, (error, response, body) => {
      if (error) {
        console.log("Error", error)
        res.status(500).send(error);
      } else {
        const assets = JSON.parse(body);
        console.log(assets);
        res.status(200).send(assets);
      }
    });
  });
})

app.get("/related-product", async (_req, res) => {
  if (_req.query && _req.query.productName) {
    // let query = {
    //   title: { $ne: _req.query.productName }
    // }
    try {
  const productDataAll = await Product.aggregate([{ $match: {title:_req.query.productName} }]);
      res.status(200).send(productDataAll[0].related_product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  } else {
    try {
      const productDataAll = await Product.aggregate([{ $sample: { size: 5 } }]);
      res.status(200).send(productDataAll);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
});

app.get("/api/theme-data-status", async (_req, res) => {
  const themeStatus = await shopify.api.rest.Asset.all({
    session: res.locals.shopify.session,
    theme_id: process.env.THEME_ID,
    asset: { "key": `${process.env.RELATED_PRODUCTS}` },
  })
  res.status(200).send({ themeValueStatus: themeStatus?.data[0].value.length > 0 });
})


app.get("/api/userinformation", async (_req, res) => {
  const ShopAllData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  })
  // console.log("res.locals", ShopAllData);
  res.status(200).send({ "res": ShopAllData });
});


app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
