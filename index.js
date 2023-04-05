const express = require("express");
var cors = require("cors");
const connective = require("./connective");
const customerRoute = require("./Routes/customer");
const productCategoryRoute = require("./Routes/productCategory");
const productsRoute = require("./Routes/products");
const billRoute = require("./Routes/bill");
const dashboardRoute = require("./Routes/dashboard");
const cartRoute = require("./Routes/cart");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/customer", customerRoute);
app.use("/category", productCategoryRoute);
app.use("/products", productsRoute);
app.use("/bill", billRoute);
app.use("/dashboard", dashboardRoute);
app.use("/cart", cartRoute);

module.exports = app;
