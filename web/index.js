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
import fetch from 'node-fetch';
import Request from 'request';
import { request } from "http";

const app = express();
app.use(express.json())
app.use(cors())
// Mongoose.connect("mongodb://localhost:27017/downtown-shopify-test");
Mongoose.connect("mongodb+srv://subhamworkojha:subhamworkojha@cluster0.enku150.mongodb.net/shopifyDowntownDemo")
  .then((res) => console.log("database connected"))
  .catch((error) => console.log("error", error))

const productSchema = new Mongoose.Schema({
  title: { type: String }
}, { strict: false });

const Product = Mongoose.model("products", productSchema);
// const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
let reletedProduct =[];
const PORT = 8081;
console.log("PORT",PORT);


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
  console.log("countData", countData)
  res.status(200).send(countData);
});

app.get("/api/recommendations", async (_req, res) => {
  const data = {
    asset: {
      key: 'sections/related-products.liquid',
      value: `
      <div class="related">
      <div class="width">
        <h2>{{ section.settings.heading }}</h2>
    
        <div class="related-products">
        </div>
      </div>
    </div>
    {% if cart.item_count > 0 %}
  {% assign relatedId = cart.items[0].product_id %}
{% else %}
  {% assign relatedId = 8233976463644 %}
{% endif %}
    `
    }
  };

  const options = {
    method: 'PUT',
    url: `https://test-downtown.myshopify.com/admin/api/2021-01/themes/147562135836/assets.json`,
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
    }
    const assets = JSON.parse(body);
    console.log(assets);
    res.status(200).send(assets);
  });


  // const requestOptions = {
  //   method: "PUT",
  //   headers: { "X-Shopify-Access-Token": "", "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     asset: {
  //       key: "sections/related-products.liquid",
  //       value: "<img src='backsoon-postit.png'><p>We are busy updating the store for you and will be back within the hour.</p>",
  //     }
  //   }),
  // };

  // try {
  //   const response = await fetch(
  //     "https://test-downtown.myshopify.com/admin/api/2023-04/themes/147562135836/assets.json",
  //     requestOptions
  //   );
  //   console.log("response", response);
  //   res.status(200).send(response);  
  // } catch (error) {
  //   console.log("error", error);
  //   res.status(500).send(error);  
  // }



  // **************
  // const responeAllTheam = await shopify.api.rest.Asset.all({
  //   session: res.locals.shopify.session,
  //   theme_id: 147562135836,
  //   asset: { "key": "sections/related-products.liquid" },
  // });

  // // res.status(200).send(responeAllTheam);
  // let value = responeAllTheam.data[0].value
  // const asset = new shopify.api.rest.Asset({ session: res.locals.shopify.session });
  // asset.theme_id = 147562135836;
  // asset.key = "sections/related-products.liquid";
  // // asset.value = value
  // asset.value =  "<h1>hello</h1>"
  // console.log("asset::", asset)

  // try {
  //   const responseSave = await asset.save({
  //     update: true
  //   });
  //   console.log("responseSave::", responseSave)
  //   res.status(200).send(responseSave);
  // } catch (error) {
  //   console.log("error::", error);
  //   res.status(500).send({ error: error });
  // }
})

// app.get("/api/users", async (_req, res) => {
//   const userDetail = await shopify.api.rest.User.all({
//     session: res.locals.shopify.session,
//   });
//   res.status(200).send(userDetail);
// });

// app.get("/api/orders", async (_req, res) => {
//   const userOrder = await shopify.api.rest.Order.all({
//     session: res.locals.shopify.session,
//     status: "any",
//   });
//   console.log("userOrder",userOrder);
//   res.status(200).send(userOrder);
// });

app.get("/api/orders/count", async (_req, res) => {
  try {
    const orderResponse = await shopify.api.rest.Order.count({
      session: res.locals.shopify.session,
      status: "any"
    });
    res.status(200).send(orderResponse);
  } catch (error) {
    console.log("error::", error)
    res.status(500).send(error);
  }

});

app.get("/api/addProducts", async (_req, res) => {
  // console.log("addProducts****************")
  const productDataAll = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  const insertResponse = await Product.insertMany(productDataAll.data)
  res.status(200).send(insertResponse);
});

app.get("/api/products", async (_req, res) => {
  const productDataAll = await Product.find();
  res.status(200).send(productDataAll);
});

app.get("/api/add-releted-theme",async (_req,res)=>{

  const data = {
    asset: {
      key: 'sections/related-products.liquid',
      value: `
      <div class="related">
      <div class="width">
        <h2 class="main-heading">{{ section.settings.heading }}</h2>      
        <div class="related-products">
        </div>
      </div>
    </div>      
    <script>
    function buildBlock(product) {
      const html = 
        <a class="related-product" href="${product.url}">
          <img src="${product.images[0]}" />
          <h3>${product.title}</h3>
          <span></span>
          <form method="post" action="/cart/add">
            <input name="id" type="hidden" value="${product.variants[0].id}" />
            <button type="submit">Add to cart</button>
          </form>
        </a>
      
      return html
    }
      function getData(){
        products = [
      {
        "_id": "6452364372715734518f56d5",
        "title": "bitter rain",
        "body_html": null,
        "vendor": "test-downtown",
        "product_type": "",
        "created_at": "2023-04-24T05:47:36-04:00",
        "handle": "bitter-rain",
        "updated_at": "2023-04-24T05:47:36-04:00",
        "published_at": null,
        "template_suffix": null,
        "status": "active",
        "published_scope": "web",
        "tags": "",
        "admin_graphql_api_id": "gid://shopify/Product/8233973907740",
        "variants": [
          {
            "id": 44998367478044,
            "product_id": 8233973907740,
            "title": "Default Title",
            "price": "5.73",
            "sku": "",
            "position": 1,
            "inventory_policy": "deny",
            "compare_at_price": null,
            "fulfillment_service": "manual",
            "inventory_management": null,
            "option1": "Default Title",
            "option2": null,
            "option3": null,
            "created_at": "2023-04-24T05:47:36-04:00", 
            "updated_at": "2023-04-24T05:47:36-04:00",
            "taxable": true,
            "barcode": null,
            "grams": 0,
            "image_id": null,
            "weight": 0,
            "weight_unit": "kg",
            "inventory_item_id": 47046867026204,
            "inventory_quantity": 0,
            "old_inventory_quantity": 0,
            "requires_shipping": true,
            "admin_graphql_api_id": "gid://shopify/ProductVariant/44998367478044"
          }
        ],
        "options": [
          {
            "id": 10443198562588,
            "product_id": 8233973907740,
            "name": "Title",
            "position": 1,
            "values": [
              "Default Title"
            ]
          }
        ],
        "images": [],
        "image": null,
        "__v": 0
      },
      {
        "_id": "6452364372715734518f56e3",
        "title": "cold meadow",
        "body_html": null,
        "vendor": "test-downtown",
        "product_type": "",
        "created_at": "2023-04-24T06:25:07-04:00",
        "handle": "cold-meadow",
        "updated_at": "2023-04-24T06:25:08-04:00",
        "published_at": null,
        "template_suffix": null,
        "status": "active",
        "published_scope": "web",
        "tags": "",
        "admin_graphql_api_id": "gid://shopify/Product/8233991766300",
        "variants": [
          {
            "id": 44998458933532,
            "product_id": 8233991766300,
            "title": "Default Title",
            "price": "3.19",
            "sku": "",
            "position": 1,
            "inventory_policy": "deny",
            "compare_at_price": null,
            "fulfillment_service": "manual",
            "inventory_management": null,
            "option1": "Default Title",
            "option2": null,
            "option3": null,
            "created_at": "2023-04-24T06:25:07-04:00",
            "updated_at": "2023-04-24T06:25:07-04:00",
            "taxable": true,
            "barcode": null,
            "grams": 0,
            "image_id": null,
            "weight": 0,
            "weight_unit": "kg",
            "inventory_item_id": 47046958547228,
            "inventory_quantity": 0,
            "old_inventory_quantity": 0,
            "requires_shipping": true,
            "admin_graphql_api_id": "gid://shopify/ProductVariant/44998458933532"
          }
        ],
        "options": [
          {
            "id": 10443220975900,
            "product_id": 8233991766300,
            "name": "Title",
            "position": 1,
            "values": [
              "Default Title"
            ]
          }
        ],
        "images": [],
        "image": null,
        "__v": 0
      },
      {
        "_id": "6452366472715734518f5705",
        "title": "autumn sunset",
        "body_html": null,
        "vendor": "test-downtown",
        "product_type": "",
        "created_at": "2023-04-19T03:29:08-04:00",
        "handle": "autumn-sunset",
        "updated_at": "2023-04-19T03:29:08-04:00",
        "published_at": null,
        "template_suffix": null,
        "status": "active",
        "published_scope": "web",
        "tags": "",
        "admin_graphql_api_id": "gid://shopify/Product/8224462864668",
        "variants": [
          {
            "id": 44967267598620,
            "product_id": 8224462864668,
            "title": "Default Title",
            "price": "2.86",
            "sku": "",
            "position": 1,
            "inventory_policy": "deny",
            "compare_at_price": null,
            "fulfillment_service": "manual",
            "inventory_management": null,
            "option1": "Default Title",
            "option2": null,
            "option3": null,
            "created_at": "2023-04-19T03:29:08-04:00",
            "updated_at": "2023-04-19T03:29:08-04:00",
            "taxable": true,
            "barcode": null,
            "grams": 0,
            "image_id": null,
            "weight": 0,
            "weight_unit": "kg",
            "inventory_item_id": 47015768228124,
            "inventory_quantity": 0,
            "old_inventory_quantity": 0,
            "requires_shipping": true,
            "admin_graphql_api_id": "gid://shopify/ProductVariant/44967267598620"
          }
        ],
        "options": [
          {
            "id": 10432269746460,
            "product_id": 8224462864668,
            "name": "Title",
            "position": 1,
            "values": [
              "Default Title"
            ]
          }
        ],
        "images": [],
        "image": null,
        "__v": 0
      },
      {
        "_id": "6452364372715734518f56d8",
        "title": "broken brook",
        "body_html": null,
        "vendor": "test-downtown",
        "product_type": "",
        "created_at": "2023-04-24T06:17:11-04:00",
        "handle": "broken-brook",
        "updated_at": "2023-04-24T06:17:11-04:00",
        "published_at": null,
        "template_suffix": null,
        "status": "active",
        "published_scope": "web",
        "tags": "",
        "admin_graphql_api_id": "gid://shopify/Product/8233986982172",
        "variants": [
          {
            "id": 44998441369884,
            "product_id": 8233986982172,
            "title": "Default Title",
            "price": "2.01",
            "sku": "",
            "position": 1,
            "inventory_policy": "deny",
            "compare_at_price": null,
            "fulfillment_service": "manual",
            "inventory_management": null,
            "option1": "Default Title",
            "option2": null,
            "option3": null,
            "created_at": "2023-04-24T06:17:11-04:00",
            "updated_at": "2023-04-24T06:17:11-04:00",
            "taxable": true,
            "barcode": null,
            "grams": 0,
            "image_id": null,
            "weight": 0,
            "weight_unit": "kg",
            "inventory_item_id": 47046940983580,
            "inventory_quantity": 0,
            "old_inventory_quantity": 0,
            "requires_shipping": true,
            "admin_graphql_api_id": "gid://shopify/ProductVariant/44998441369884"
          }
        ],
        "options": [
          {
            "id": 10443214291228,
            "product_id": 8233986982172,
            "name": "Title",
            "position": 1,
            "values": [
              "Default Title"
            ]
          }
        ],
        "images": [],
        "image": null,
        "__v": 0
      },
      {
        "_id": "645235e772715734518f56ab",
        "title": "cold bush",
        "body_html": null,
        "vendor": "test-downtown",
        "product_type": "",
        "created_at": "2023-04-24T06:26:12-04:00",
        "handle": "cold-bush",
        "updated_at": "2023-04-24T06:26:12-04:00",
        "published_at": null,
        "template_suffix": null,
        "status": "active",
        "published_scope": "web",
        "tags": "",
        "admin_graphql_api_id": "gid://shopify/Product/8233992519964",
        "variants": [
          {
            "id": 44998461161756,
            "product_id": 8233992519964,
            "title": "Default Title",
            "price": "0.61",
            "sku": "",
            "position": 1,
            "inventory_policy": "deny",
            "compare_at_price": null,
            "fulfillment_service": "manual",
            "inventory_management": null,
            "option1": "Default Title",
            "option2": null,
            "option3": null,
            "created_at": "2023-04-24T06:26:12-04:00",
            "updated_at": "2023-04-24T06:26:12-04:00",
            "taxable": true,
            "barcode": null,
            "grams": 0,
            "image_id": null,
            "weight": 0,
            "weight_unit": "kg",
            "inventory_item_id": 47046960775452,
            "inventory_quantity": 0,
            "old_inventory_quantity": 0,
            "requires_shipping": true,
            "admin_graphql_api_id": "gid://shopify/ProductVariant/44998461161756"
          }
        ],
        "options": [
          {
            "id": 10443221991708,
            "product_id": 8233992519964,
            "name": "Title",
            "position": 1,
            "values": [
              "Default Title"
            ]
          }
        ],
        "images": [],
        "image": null,
        "__v": 0
      }
    ]
        console.log("products", products)
        products.forEach(product => {
          const html = buildBlock(product)
          document.querySelector('.related-products').innerHTML += html
        })
        console.log(products)
      }        
      getData();
    </script>
    <style>
      .main-heading{
            display: flex;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: 600;
      }
    .related-products {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    
    .related-product {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 33%;
      margin-bottom: 30px;
    }
    
    .related-product img {
      max-width: 100%;
      margin-bottom: 10px;
      height:330px;
      max-height:300px;
    }
    
    .related-product h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .related-product span {
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .related-product form {
      display: flex;
      align-items: center;
    }
    
    .related-product button {
      background-color: #000;
      color: #fff;
      padding: 10px 20px;
      border: none;
      border-radius: 0;
      text-transform: uppercase;
      font-weight: bold;
      cursor: pointer;
    }
      
    </style>
    {% schema %}
    {
      "name": "Related products",
      "settings": [
        {
          "type": "text",
          "label": "Heading",
          "id": "heading",
          "default": "You may also like"
        }
      ],
      "presets": [
        {
          "name": "Related products"
        }
      ]
    }
    {% endschema %}
    `
    }
  };

  const options = {
    method: 'PUT',
    url: `https://test-downtown.myshopify.com/admin/api/2021-01/themes/147562135836/assets.json`,
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
    }
    const assets = JSON.parse(body);
    console.log(assets);
    res.status(200).send(assets);
  });
})

app.get("/api/related-product", async (_req, res) => {
  try {
    const productDataAll = await Product.aggregate([{ $sample: { size: 5 } }]);
    res.status(200).send(productDataAll);
    
    
  } 
  catch (error) {
    res.status(500).send({ message: error.message });
  }
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
