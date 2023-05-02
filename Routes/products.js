const express = require("express");
const connective = require("../connective");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../service/authentication");
const checkRole = require("../service/checkRole");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../frontend/src/assets/up");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create Multer object with storage configuration
const upload = multer({ storage: storage });

//---- Add product ----//
router.post(
  "/add",
  checkRole.checkRole,
  auth.authenticateToken,
  upload.single("photo"),
  (req, res) => {
    let product = req.body;
    product.photo = "../../../assets/up/" + req.file.filename;

    const sql =
      "INSERT INTO products (name, categoryID, description, price, photo, status) VALUES (?, ?, ?, ?, ?, 'Available')";

    connective.query(
      sql,
      [
        product.name,
        product.categoryID,
        product.description,
        product.price,
        product.photo,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Error adding product", error: err });
        }

        const imageUrl = `http://localhost:8080/uploads/${product.photo}`;
        return res
          .status(200)
          .json({ message: "Product added successfully", imageUrl: imageUrl });
      }
    );
  }
);

//-------Products Details------//

router.get("/details", (req, res) => {
  let products = req.body;
  var logic = "select * from products order by id";
  connective.query(logic, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json;
    }
  });
});

//-------Products Details By Category------//

router.get(
  "/getByCategory/:id",

  (req, res) => {
    const id = req.params.id;
    var logic =
      "select id,name from products where status='Available'and categoryID=?";
    connective.query(logic, [id], (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

//-------Products Details By ID------//

router.get("/getById/:id", (req, res) => {
  let id = req.params.id;
  var logic = "select price from products where id=?";
  connective.query(logic, [id], (err, results) => {
    if (!err) {
      const price = results[0].price;
      return res.status(200).send(price.toString());
    } else {
      return res.status(500).json(err);
    }
  });
});

//-------Products Update------//

router.put("/update", upload.single("photo"), (req, res) => {
  const product = {
    id: req.body.id,
    name: req.body.name,
    categoryID: req.body.categoryID,
    description: req.body.description,
    price: req.body.price,
    status: "Available",
    photo: req.file ? "../../../assets/up/" + req.file.filename : null,
  };

  const sql = "UPDATE products SET ? WHERE id = ?";

  connective.query(sql, [product, product.id], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error updating product", error: err });
    }

    const imageUrl = product.photo
      ? `http://localhost:8080/uploads/${product.photo}`
      : null;

    return res
      .status(200)
      .json({ message: "Product updated successfully", imageUrl: imageUrl });
  });
});

//-------Products Delete------//

router.delete(
  "/delete",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    let products = req.body;
    var logic = "delete from products where id=?";
    connective.query(logic, [products.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res
            .status(404)
            .json({ message: "Product ID Not Found. Please Check the ID" });
        } else {
          return res
            .status(200)
            .json({ message: "Product Successfully Deleted." });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

// -----status Available------//
router.patch(
  "/status",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const data = req.body;

    logic = "update products set status=? where id=?";
    connective.query(logic, [data.status, data.id], (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

// ---change product image----//
router.patch(
  "/image",
  auth.authenticateToken,
  checkRole.checkRole,
  upload.single("photo"),
  (req, res) => {
    const id = req.body.id;
    console.log(req.body);
    const Image = {
      photo: req.file ? "../../../assets/up/" + req.file.filename : null,
    };
    logic = "update products set photo=? where id=?";
    connective.query(logic, [Image.photo, id], (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

// -------------change product price---------//
router.patch(
  "/price",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const Price = req.body;

    logic = "update products set price=? where id=?";
    connective.query(logic, [Price.price, Price.id], (err, results) => {
      if (results.affectedRows == 0) {
        return res.status(500).json(err);
      } else {
        return res.status(200).json(results);
      }
    });
  }
);

//------Product name-------//

router.get("/pname", (req, res) => {
  var logic = "select name from products";
  connective.query(logic, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

// --Display product card---//

router.get("/showCategoryWise", (req, res) => {
  const category = req.query.category;
  let sql = "";
  if (category === "biriyani") {
    sql = "select * from products where categoryID=1  and status='Available'";
  } else if (category === "bread") {
    sql = "select * from products where categoryID=6 and status='Available'";
  } else if (category === "softDrinks") {
    sql = "select * from products where categoryID=7 and status='Available'";
  } else if (category === "all") {
    sql = "select * from products where status='Available'";
  } else {
    return res.status(400).json({ message: "Invalid category" });
  }
  connective.query(sql, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
