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

app.get("/api/handle", async (_req, res) => {
  try {
    const product = await shopify.product.get({ handle: req.params.handle });
    const data = await client.query({
      data: {
        query: `query getProductIdFromHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id
          }
        }`,
        variables: {
          handle: 'element',
        },
      },
    });

    res.json({
      success: true,
      productId: data.productByHandle.id,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/products", async (_req, res) => {
  const productDataAll = await Product.find();
  res.status(200).send(productDataAll);
});

app.get("/api/add-related-theme", async (_req, res) => {
  fs.readFile('./theme-assets.html', 'utf8', function (err, HtmlData) {
    console.log("data", HtmlData);
    const data = {
      asset: {
        key: 'sections/related-products.liquid',
        value: `<div class="related">
        <div class="width">
          <h2 class="main-heading">{{ section.settings.heading }}</h2>
      
          <div class="related-products">
          </div>
        </div>
      </div>
      
      <script>
      function buildBlock(product) {
        console.log("buildBlock", product)
        const html =${HtmlData} 
        return html
      }
        function getData(){
          fetch('https://shopify-product-test-2.onrender.com/related-product')
            .then(response => response.json())
            .then(products => {
              console.log("products", products)
              products && products.forEach(product => {
                const html = buildBlock(product)
                document.querySelector('.related-products').innerHTML += html
              })
            })
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
      {% endschema %}`
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
    let query = {
      title: { $ne: _req.query.productName }
    }

    try {
      const productDataAll = await Product.aggregate([{ $match: query }, { $sample: { size: 5 } }]);
      res.status(200).send(productDataAll);
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
