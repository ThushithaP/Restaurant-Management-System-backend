const express = require("express");
const connective = require("../connective");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
var auth = require("../service/authentication");
var checkRole = require("../service/checkRole");

//-------------------Signup-----------------//

router.post("/signup", (req, res) => {
  let customer = req.body;
  logic = "select email,password,role,status from customer where email=?";
  connective.query(logic, [customer.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        logic =
          "insert into customer(name,email,phoneNumber,password,role,status) values(?,?,?,?,'customer','Active')";
        connective.query(
          logic,
          [
            customer.name,
            customer.email,
            customer.phoneNumber,
            customer.password,
          ],
          (err, results) => {
            if (!err) {
              return res.status(200).json({
                message:
                  "Congartulations!!! You are Registered to Biriyani Hut Succesfully...",
              });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(500).json({ message: "Email already exist" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

//-------------------Login-----------------//

router.post("/login", (req, res) => {
  let customer = req.body;
  logic = "select name,email,password,role,status from customer where email=?";
  connective.query(logic, [customer.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != customer.password) {
        return res
          .status(403)
          .json({ message: "Inavalid email or password. Please Re-Check!!!" });
      } else if (results[0].status === "Deactive") {
        return res.status(401).json({ message: "Wait for Approval" });
      } else if (results[0].password == customer.password) {
        const responed = {
          name: results[0].name,
          email: results[0].email,
          role: results[0].role,
        };
        const accessToken = jwt.sign(responed, process.env.ACCESS_TOKEN, {
          expiresIn: "6h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res
          .status(400)
          .json({ message: "Ooops!! Something Wrong. Try again later.." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

//-------------------Customer Details-----------------//

router.get(
  "/customerDetails",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    let customer = req.body;
    logic =
      "select id,name,phoneNumber,email,password,role,status from customer where role='customer'";
    connective.query(logic, (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

//-------------------Update Customer Status-----------------//

router.patch(
  "/updateCustomer",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    let customer = req.body;
    var logic = "update customer set status=? where id=?";
    connective.query(logic, [customer.status, customer.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Inavalid Id" });
        } else {
          return res.status(200).json({ message: "Successfully Updated" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

//-------------------Check Token-----------------//

router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({ message: "true" });
});

//-------------------mail transport-----------------//
var transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

//-------------------forgot password-----------------//

router.post("/forgotPassword", (req, res) => {
  const customer = req.body;
  logic = "select email,password from customer where email=?";
  connective.query(logic, [customer.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(200).json({ message: "Password sent to Email" });
      } else {
        var mail = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Password of You Biriyani Hut account",
          html:
            "<p><b>Your Account Details Of Biriyani Hut</b><br><b>Email :</b>" +
            results[0].email +
            "<br><b>Password :</b>" +
            results[0].password +
            "</p>",
        };
        transport.sendMail(mail, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res.status(200).json({ message: "Password sent to Email" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

//-------------------update password-----------------//

router.post("/changePassword", (req, res) => {
  const customer = req.body;

  var logic = "select * from customer where email=? and password=?";
  connective.query(
    logic,
    [customer.email, customer.oldPassword],
    (err, results) => {
      if (!err) {
        if (results.length <= 0) {
          console.log(results);
          return res.status(400).json(err);
        } else if (results[0].password == customer.oldPassword) {
          logic = "update customer set password=? where email=?";
          connective.query(
            logic,
            [customer.newPassword, customer.email],
            (err, results) => {
              if (!err) {
                return res
                  .status(200)
                  .json({ message: "Password Updated Successfully." });
              } else {
                return res.status(500).json(err);
              }
            }
          );
        } else {
          return res
            .status(400)
            .json({ message: "Something wrong..Please try again" });
        }
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

//---Change Customer Details-----//

router.patch("/changeDetails", (req, res) => {
  const customer = req.body;

  var logic =
    "update customer set name=?,phoneNumber=?,email=? where password=?";
  connective.query(
    logic,
    [customer.name, customer.phoneNumber, customer.email, customer.password],
    (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(401).json({ message: "Inavalid password" });
        } else {
          return res.status(200).json({ message: "Successfully Updated" });
        }
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

//------Delete Customer-------//
router.delete(
  "/deleteCustomer",
  auth.authenticateToken,
  checkRole.checkRole,
  (req, res) => {
    const customer = req.body;
    var logic = "delete from customer where id=?";
    connective.query(logic, [customer.id], (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(401).json({ message: "Something went wrong" });
        } else {
          return res
            .status(200)
            .json({ message: "Successfully deleted customer" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  }
);

module.exports = router;
