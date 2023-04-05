const { json } = require("express");
const express = require("express");
const connective = require("../connective");
const { authenticateToken } = require("../service/authentication");
const router = express.Router();
var auth = require("../service/authentication");

router.get("/details", (req, res, next) => {
  var categoryCount;
  var productCount;
  var billCount;
  var delivery;

  var logic = "select count(id) as categoryCount from productCategory";
  connective.query(logic, (err, results) => {
    if (!err) {
      categoryCount = results[0].categoryCount;
    } else {
      return res.status(500).json(err);
    }
  });

  var logic = "select count(id) as delivery from cart where status='Delivered'";
  connective.query(logic, (err, results) => {
    if (!err) {
      delivery = results[0].delivery;
    } else {
      return res.status(500).json(err);
    }
  });

  var logic = "select count(id) as productCount from products";
  connective.query(logic, (err, results) => {
    if (!err) {
      productCount = results[0].productCount;
    } else {
      return res.status(500).json(err);
    }
  });

  var logic = "select count(id) as billCount from bill";
  connective.query(logic, (err, results) => {
    if (!err) {
      billCount = results[0].billCount;
      var data = {
        category: categoryCount,
        products: productCount,
        bill: billCount,
        delivered: delivery,
      };

      return res.status(200).json(data);
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
