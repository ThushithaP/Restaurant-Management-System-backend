const express = require("express");
const connective = require("../connective");
const router = express.Router();
const moment = require("moment-timezone");
var auth = require("../service/authentication");
var checkRole = require("../service/checkRole");

//---------- submit cart order
router.post("/orders", (req, res) => {
  const order = req.body;

  logic =
    "insert into cart (dateUser,nameUser,addressUser,numberUser,cartList,total,status) values (?,?,?,?,?,?,'NotDelivered')";
  connective.query(
    logic,
    [
      order.dateUser,
      order.nameUser,
      order.addressUser,
      order.numberUser,
      order.cartList,
      order.total,
    ],
    (err, results) => {
      if (!err) {
        return res
          .status(200)
          .json({ message: "Successfully added cart order" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

//------------ get cart orders details

router.get("/cartOrder", (req, res) => {
  var logic = "select * from cart ";
  connective.query(logic, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

//----------- update delivery status
router.patch(
  "/updateDelivery",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const delivery = req.body;
    console.log(delivery);

    var logic = "update cart set status=? where id=?";
    connective.query(logic, [delivery.status, delivery.id], (err, results) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        return res.status(200).json(results);
      }
    });
  }
);

//-------------- Delete Order

router.delete("/deleteOrder/:id", (req, res) => {
  const deliver = req.params;
  console.log(deliver);
  logic = "delete from cart where id=?";
  connective.query(logic, [deliver.id], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

//------------- My orders
router.get("/myOrder", (req, res) => {
  let name = req.query.nameUser;

  logic = "select *from cart where nameUser=? ORDER BY id DESC LIMIT 1";
  connective.query(logic, [name], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
