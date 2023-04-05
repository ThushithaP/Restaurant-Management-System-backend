const express = require("express");
const connective = require("../connective");
const router = express.Router();
const jwt = require("jsonwebtoken");
var auth = require("../service/authentication");
var checkRole = require("../service/checkRole");

//---------Add category--------//

router.post(
  "/add",
  auth.authenticateToken,
  checkRole.checkRole,

  (req, res, next) => {
    let category = req.body;
    logic = "insert into productCategory (name) values (?)";
    connective.query(logic, [category.name], (err, results) => {
      if (!err) {
        return res
          .status(200)
          .json({ message: "Succesfully added the category" });
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

//---------Category Details--------//

router.get("/details", (req, res, next) => {
  logic = "select *from productCategory order by id";
  connective.query(logic, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json(err);
    }
  });
});

//---------Update Category--------//

router.patch(
  "/update",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res, next) => {
    let category = req.body;
    logic = "update productCategory set name=? where id=?";
    connective.query(logic, [category.name, category.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json(err);
        } else {
          return res
            .status(200)
            .json({ message: "Category Successfully Updated" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

//---------Delete Category--------//

router.delete(
  "/delete",
  auth.authenticateToken,
  checkRole.checkRole,

  (req, res, next) => {
    let category = req.body;
    console.log("badu");
    logic = "delete from productCategory where id=?";
    connective.query(logic, [category.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Incorrect Category ID" });
        } else {
          return res
            .status(200)
            .json({ message: "Category Deleted Successfully" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

module.exports = router;
