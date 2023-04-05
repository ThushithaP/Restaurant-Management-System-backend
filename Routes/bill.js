const express = require("express");
const connective = require("../connective");
const router = express.Router();
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
var fs = require("fs");
var uuid = require("uuid");
var auth = require("../service/authentication");

/*-------generate bill -----------*/
router.post("/generateBill", auth.authenticateToken, (req, res) => {
  const generateUuid = uuid.v1();
  console.log(req.body);
  const orderDetails = req.body;
  const location = "../../../assets/bill/" + generateUuid + ".pdf";
  var productsDetailsReport = JSON.parse(orderDetails.productsDetails);

  var logic =
    "insert into bill (name,uuid,email,phoneNumber,paymentMethod,total,productsDetails,createdBy,path) values (?,?,?,?,?,?,?,?,?)";
  connective.query(
    logic,
    [
      orderDetails.name,
      generateUuid,
      orderDetails.email,
      orderDetails.phoneNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productsDetails,
      res.locals.email,
      location,
    ],
    (err, results) => {
      if (!err) {
        ejs.renderFile(
          path.join(__dirname, "", "bill.ejs"),
          {
            productsDetails: productsDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            phoneNumber: orderDetails.phoneNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount,
          },
          (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json(err);
            } else {
              pdf
                .create(results)
                .toFile(
                  "../frontend/src/assets/bill/" + generateUuid + ".pdf",
                  function (err, data) {
                    if (err) {
                      console.log("gg");

                      return res.status(500).json(err);
                    } else {
                      return res.status(200).json({ uuid: generateUuid });
                    }
                  }
                );
            }
          }
        );
      } else {
        console.log(err);
        return res.status(500).json(err);
      }
    }
  );
});

/*---------- bill details ------------ */
router.get("/getDetails", auth.authenticateToken, (req, res, next) => {
  var logic = "select * from bill";
  connective.query(logic, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});
//----------- delete bill--------//
router.delete("/deleteBill/:id", auth.authenticateToken, (req, res, next) => {
  let bill = req.params;
  var logic = "delete from bill where id=?";
  connective.query(logic, [bill.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json(err);
      } else {
        return res
          .status(200)
          .json({ message: "Product Successfully Deleted." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
