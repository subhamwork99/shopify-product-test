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
import crypto from "crypto";

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
const shopSchema = new Mongoose.Schema({title: { type: String }}, { strict: false });
const ShopDb = Mongoose.model("shop", shopSchema);

//customers request Schema
const customerRequestSchema = new Mongoose.Schema({}, { strict: false });
const CustomerRequestDb  = Mongoose.model("customers_request", customerRequestSchema);

//customers redact Schema
const customerRedactSchema = new Mongoose.Schema({}, { strict: false });
const CustomerRedactDb  = Mongoose.model("customers_redact", customerRedactSchema);

//shop redact Schema
const shopRedactSchema = new Mongoose.Schema({}, { strict: false });
const ShopRedactDb = Mongoose.model("shop_redact", shopRedactSchema);

// const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const PORT = 8081;
console.log("PORT", PORT);


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
  shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  }).then(async(shopData)=>{
    const countData = await Product.count({ shop_name: shopData?.data[0]?.domain });
    res.status(200).send({ count: countData });
  }).catch((error)=>{
    res.status(500).send(error);
  })
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

app.get("/api/addProducts", async (_req, res) => {
  try {
    const TotalProduct = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });

    shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    })
      .then(async (shopData) => {
        let checkShopData = await ShopDb.aggregate([{ $match: { domain: shopData?.data[0]?.domain } }])
        if (checkShopData.length == 0) {
          await ShopDb.insertMany({ ...shopData.data[0], releted_product_theme: false, shop_optimization: true })
        }
        let query = {
          limit: process.env.PRODUCT_FETCH_LIMIT ? process.env.PRODUCT_FETCH_LIMIT: 250
        }
        let Count = Math.ceil(TotalProduct.count / query?.limit);
        let AllProducts = [];
        const productData = await shopify.api.rest.Product.all({
          session: res.locals.shopify.session,
          limit: query?.limit
        });
        query.pageInfo = productData?.pageInfo?.nextPage?.query?.page_info
        AllProducts.push(...productData.data)

        for (let page = 2; page <= Count; page++) {
          const productData = await shopify.api.rest.Product.all({
            session: res.locals.shopify.session,
            limit: query?.limit,
            page_info: query?.pageInfo
          });
          query.pageInfo = productData?.pageInfo?.nextPage?.query?.page_info
          AllProducts.push(...productData?.data)
        }
        const newObject = await Promise.all(
          AllProducts.map(async (product) => {
            const relatedProduct = [];
            for (const subProduct of AllProducts) {
              if (relatedProduct.length === 5) {
                break; // Break the loop if 5 related products are already added
              }

              if (subProduct?.handle !== product?.handle &&
                subProduct?.product_type === product?.product_type && subProduct?.product_type !== "") {
                relatedProduct.push({
                  ...subProduct,
                  shop_name: shopData?.data[0]?.domain,
                  product_url: `https://${encodeURIComponent(shopData?.data[0]?.domain)}/products/${encodeURIComponent(subProduct?.handle)}`,
                });
              }
            }

            if (relatedProduct.length < 5) {
              for (const subProduct of AllProducts) {
                if (relatedProduct.length === 5) {
                  break; // Break the loop if 5 related products are already added
                }

                if (subProduct?.handle !== product?.handle &&
                  !relatedProduct.some(
                    (related) => related?.handle === subProduct?.handle
                  )) {
                  relatedProduct.push({
                    ...subProduct,
                    shop_name: shopData?.data[0]?.domain,
                    product_url: `https://${encodeURIComponent(shopData?.data[0]?.domain)}/products/${encodeURIComponent(subProduct?.handle)}`,
                  });
                }
              }
            }
            return {
              related_product: relatedProduct,
              shop_name: shopData?.data[0]?.domain,
              product_url: `https://${encodeURIComponent(shopData?.data[0]?.domain)}/products/${encodeURIComponent(product?.handle)}`,
              ...product,
            };
          })
        );

        //add product 
        await Product.insertMany(newObject);
        res.status(200).send({ "message": "Product added successfully" });
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/updateCatlog", async (_req, res) => {
  try {
    const TotalProduct = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });

    shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    })
      .then(async (shopData) => {
        await Product.deleteMany({ shop_name: shopData?.data[0]?.domain });
        let query = {
          limit: process.env.PRODUCT_FETCH_LIMIT ? process.env.PRODUCT_FETCH_LIMIT: 250
        }
        let Count = Math.ceil(TotalProduct.count / query?.limit);
        let AllProducts = [];
        const productData = await shopify.api.rest.Product.all({
          session: res.locals.shopify.session,
          limit: query?.limit
        });
        query.pageInfo = productData?.pageInfo?.nextPage?.query?.page_info
        AllProducts.push(...productData.data)

        for (let page = 2; page <= Count; page++) {
          const productData = await shopify.api.rest.Product.all({
            session: res.locals.shopify.session,
            limit: query?.limit,
            page_info: query?.pageInfo
          });
          query.pageInfo = productData?.pageInfo?.nextPage?.query?.page_info
          AllProducts.push(...productData?.data)
        }
        console.log("domain_name",shopData?.data[0]?.domain );
        const newObject = await Promise.all(
          AllProducts.map(async (product) => {
            const relatedProduct = [];
            for (const subProduct of AllProducts) {
              if (relatedProduct.length === 5) {
                break; // Break the loop if 5 related products are already added
              }

              if (subProduct?.handle !== product?.handle &&
                subProduct?.product_type === product?.product_type && subProduct?.product_type !== "") {
                relatedProduct.push({
                  ...subProduct,
                  shop_name: shopData?.data[0]?.domain,
                  product_url: `https://${encodeURIComponent(shopData?.data[0]?.domain)}/products/${encodeURIComponent(subProduct?.handle)}`,
                });
              }
            }
            if (relatedProduct.length < 5) {
              for (const subProduct of AllProducts) {
                if (relatedProduct.length === 5) {
                  break; // Break the loop if 5 related products are already added
                }

                if (subProduct?.handle !== product?.handle &&
                  !relatedProduct?.some(
                    (related) => related?.handle === subProduct?.handle
                  )) {
                  relatedProduct.push({
                    ...subProduct,
                    shop_name: shopData?.data[0]?.domain,
                    product_url: `https://${encodeURIComponent(shopData?.data[0]?.domain)}/products/${encodeURIComponent(subProduct?.handle)}`,
                  });
                }
              }
            }
            return {
              related_product: relatedProduct,
              shop_name: shopData?.data[0]?.domain,
              product_url: `https://${encodeURIComponent(shopData?.data[0]?.domain)}/products/${encodeURIComponent(product?.handle)}`,
              ...product,
            };
          })
        );

        await Product.insertMany(newObject);
        res.status(200).send({ "message": "Product updated successfully" });
      })
      .catch((error) => {
        res.status(500).send(error);
      });
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
  shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  }).then(async(shopData)=>{

  // Add the condition to filter products by shop_name
  const productDataAll = await Product.find({ shop_name: shopData?.data[0]?.domain }, {}, { skip: skip, limit: limit });
  const productCount = await Product.count({ shop_name: shopData?.data[0]?.domain });
  const fetchShopData = await ShopDb.aggregate([{ $match: { domain: shopData?.data[0]?.domain } }])

  res.status(200).send({ products: productDataAll, productCount: productCount ,shop_optimization : fetchShopData[0]?.shop_optimization});
  }).catch((error)=>{
    res.status(500).send(error);
  })
});


app.get("/api/orders", async (_req, res) => {
  let page = parseInt(_req.query.pageNumber)
  let limit = process.env.PRODUCT_LIST_LIMIT;
  let skip = (page - 1) * limit;
  const orderDataAll = await Order.find({}, {}, { skip: skip, limit: limit });
  const orderCount = await Order.count({});
  res.status(200).send({ orders: orderDataAll, orderCount: orderCount });
})

// app.get("/api/add-related-theme", async (_req, res) => {

//   let recommendationsChange = _req.query.recommendationsChange

//   fs.readFile('./theme-assets.html', 'utf8', function (err, HtmlData) {
//     const data = {
//       asset: {
//         key: `${process.env.RELATED_PRODUCTS}`,
//         value: (recommendationsChange === 'true') ? ` ${HtmlData} ` : null
//       }
//     };
//     shopify.api.rest.Shop.all({
//       session: res.locals.shopify.session,
//     }).then((shopData)=>{
//       shopify.api.rest.Theme.all({ session: res.locals.shopify.session })
//         .then((themesResponse) => {
//           const themes = themesResponse.data;
    
//           let currentThemeId;
//           themes.forEach((theme) => {
//             if (theme.role === 'main' || theme.role === 'published') {
//               currentThemeId = theme.id;
//             }
//           });
//           const options = {
//             method: 'PUT',
//             url: `https://${shopData?.data[0]?.domain}/admin/api/2021-01/themes/${currentThemeId}/assets.json`,
//             headers: {
//               'X-Shopify-Access-Token': res.locals.shopify.session.accessToken,
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//           };
//           Request(options, (error, response, body) => {
//             if (error) {
//               console.log("Error", error)
//               res.status(500).send(error);
//             } else {
//               const assets = JSON.parse(body);
//               console.log(assets);
//               res.status(200).send(assets);
//             }
//           });
//         })
//         .catch((error) => {
//           res.status(500).send(error);
//         });
//     }).catch((error)=>{
//       res.status(500).send('Internal Server Error');
//     })
//   });
// })

app.get("/api/add-related-theme", async (_req, res) => {
  shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  }).then(async(shopValue)=>{
  if (_req.query && _req.query.recommendationsChange) {   
    let recommendationsChange = _req.query.recommendationsChange;
    try {
      // let shopData = await ShopDb.aggregate([{ $match: { domain: shopValue.data[0].domain } }])
      ShopDb.findOneAndUpdate({domain: shopValue.data[0]?.domain},{$set:{releted_product_theme : recommendationsChange}}).then((response)=>{
        console.log("response success",response);
      }).catch((error)=>{ 
        console.log("response error");
      })
      res.status(200).send({success:"success"});
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
}).catch((error)=>{
  res.status(400).send({ message: error.message });
})
})

app.get("/related-product", async (_req, res) => {  
  if(_req.query && _req.query.currentURL) {
    try {
      const modifiedURL = _req.query.currentURL.replace(/(\?_[^&?]+)/, ''); // Remove dynamic parameter
      let productDataAll = await Product.aggregate([{ $match: { product_url: modifiedURL } }]);
      res.status(200).send(productDataAll[0]?.related_product);
    } catch (error) {
      res.status(500).send({ message: error.message });
    } 
  } else {
    res.status(500).send({ message: "Shop Not found" });
  }
});

app.post("/customers/data_request", async (_req, res) => {  
  const hmac = _req.header("X-Shopify-Hmac-Sha256");
  const topic = _req.header("X-Shopify-Topic");
  const shop = _req.header("X-Shopify-Shop-Domain");
  console.log("hmac", hmac)
  console.log("topic", topic)
  console.log("shop", shop)

  const verified = verifyWebhook(_req.body, hmac);
  console.log("verified", verified)

  if (!verified) {
    console.log("Failed to verify the incoming request.");
    res.status(401).send("Could not verify request.");
    return;
  }

  const data = _req.body.toString();
  const payload = JSON.parse(data);
  console.log(
    `Verified webhook request. Shop: ${shop} Topic: ${topic} \n Payload: \n ${data}`
  );

  await CustomerRequestDb.insertMany(payload);
  res.status(200).send();
});

app.post("/customers/redact", async (_req, res) => {  
  const hmac = _req.header("X-Shopify-Hmac-Sha256");
  const topic = _req.header("X-Shopify-Topic");
  const shop = _req.header("X-Shopify-Shop-Domain");
  console.log("hmac", hmac)
  console.log("topic", topic)
  console.log("shop", shop)

  const verified = verifyWebhook(_req.body, hmac);
  console.log("verified", verified)

  if (!verified) {
    console.log("Failed to verify the incoming request.");
    res.status(401).send("Could not verify request.");
    return;
  }

  const data = _req.body.toString();
  const payload = JSON.parse(data);
  console.log(
    `Verified webhook request. Shop: ${shop} Topic: ${topic} \n Payload: \n ${data}`
  );

  await CustomerRedactDb.insertMany(payload);
  res.status(200).send();
});

app.post("/shop/redact", async (_req, res) => {  
  const hmac = _req.header("X-Shopify-Hmac-Sha256");
  const topic = _req.header("X-Shopify-Topic");
  const shop = _req.header("X-Shopify-Shop-Domain");
  console.log("hmac", hmac)
  console.log("topic", topic)
  console.log("shop", shop)

  const verified = verifyWebhook(_req.body, hmac);
  console.log("verified", verified)

  if (!verified) {
    console.log("Failed to verify the incoming request.");
    res.status(401).send("Could not verify request.");
    return;
  }

  const data = _req.body.toString();
  const payload = JSON.parse(data);
  console.log(
    `Verified webhook request. Shop: ${shop} Topic: ${topic} \n Payload: \n ${data}`
  );

  await ShopRedactDb.insertMany(payload);
  res.status(200).send();
});

function verifyWebhook(payload, hmac) {  
  const message = payload.toString();
  const genHash = crypto
    .createHmac("sha256", process.env.API_SECRET_KEY)
    .update(message)
    .digest("base64");
  console.log(genHash);
  return genHash === hmac;
}



app.get("/theme-data-status", async (_req, res) => {
  console.log("_req.query.currentURL",_req?.query?.currentURL);
  if (_req.query && _req.query.currentURL) {
    const domainName =new URL(_req.query.currentURL).hostname;
  try {
    let shopData = await ShopDb.aggregate([{ $match: { domain: domainName } }])
    console.log("shopData",shopData);
    res.status(200).send({ themeValueStatus: shopData[0]?.releted_product_theme , money_format : shopData[0]?.money_format});
  } catch (error) {
    res.status(500).send({ message: error?.message });
  }
}
});

app.get("/api/theme-data-status-checkBox", async (_req, res) => {
  shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  }).then(async(shopValue)=>{
  try {
    let shopData = await ShopDb.aggregate([{ $match: { domain: shopValue?.data[0]?.domain } }])
    console.log("shopValue",shopValue);
    res.status(200).send({ themeValueStatus: shopData[0]?.releted_product_theme });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})
});

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
