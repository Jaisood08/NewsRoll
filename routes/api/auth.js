const express = require("express");
const ejs = require("ejs");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const key = require("../../setup/myurl");
const bodyparser = require("body-parser");
var JSAlert = require("js-alert");
var fs = require('fs');
var path = require("path");
const PIN = "55555"

//Cookies
const cookieParser = require('cookie-parser');
router.use(cookieParser())

// @type    GET
//@route    /api/auth
// @desc    just for testing
// @access  PUBLIC
router.get("/", (req, res) => res.json({ test: "Auth is being tested" }));


//Import Schema for Person to Register
const Person = require("../../models/Person");

// @type    POST
//@route    /api/auth/register
// @desc    route for registration of users
// @access  PUBLIC

router.post("/register", (req, res) => {
  Person.findOne({ email: req.body.user.email })
    .then(person => {
      if (person) {
        return res
          .status(400)
          .send("<script>if(confirm('User Already Registered Kindly Login')) document.location = '/Login';</script>")
      } else {
        console.log(path.basename(req.body.user.profilepic));
        var FN = path.basename(req.body.user.profilepic)
        try {
          var XT = fs.readFileSync(path.join('public/myupload/' + FN));
        }
        catch {
          FN = "DP.jpg"
        }

        console.log(req.body.user.usertype);

        const newPerson = new Person({
          profilepic: {
            data: fs.readFileSync(path.join('public/myupload/' + FN)),
            contentType: 'image/' + req.body.user.profilepic.split('.').pop()
          },
          name: req.body.user.name,
          username: req.body.user.username,
          usertype: req.body.user.usertype,
          email: req.body.user.email,
          password: req.body.user.password,
          mobile: req.body.user.mobile,
          areacode: req.body.user.areacode,
          address: req.body.user.address
        });

        if (req.body.user.usertype == "Vendor" || req.body.user.usertype == "Delivery Person") {
          if (req.body.user.PIN != PIN) {
            res.send("<script>if(confirm('Passkey Failed')) document.location = '/Register';</script>")
          }

        }

        //Encrypt password using bcrypt
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPerson.password, salt, (err, hash) => {
            if (err => console.log(err));
            newPerson.password = hash;
            newPerson
              .save()
              .then(person => {
                res.send("<script>if(confirm('Successfully Registered Kindly Login')) document.location = '/Login';</script>")
              })
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

// @type    POST
//@route    /api/auth/login
// @desc    route for login of users
// @access  PUBLIC

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  Person.findOne({ email })
    .then(person => {
      if (!person) {
        return res
          .status(404)
          .send("<script>if(confirm('Kindly Register to Login')) document.location = '/Register';</script>");
      }
      bcrypt
        .compare(password, person.password)
        .then(isCorrect => {
          if (isCorrect) {
            // res.json({ success: "User is able to login successfully" });
            //use payload and create token for user
            const payload = {
              id: person.id,
              name: person.name,
              email: person.email
            };
            jsonwt.sign(
              payload,
              key.secret,
              { expiresIn: 3600 },
              (err, token) => {
                res.cookie('token', token, { httpOnly: true });
                res.redirect("/")
              }
            );
          } else {
            res.status(400).send("<script>if(confirm('Incorrect Password')) document.location = '/Login';</script>")
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});


// @type    GET
//@route    /api/auth/profile/token
// @desc    route for user profile
// @access  Public

router.get("/profile/token", (req, res) => {
  res.json({ token: "Bearer " + req.cookies.token })
});

// @type    GET
//@route    /api/auth/profile/logout
// @desc    route for user profile
// @access  Public

router.get("/profile/logout", (req, res) => {
  res.cookie('token', " ");
  res.redirect("/")
});


// @type    GET
//@route    /api/auth/profile
// @desc    route for user profile
// @access  PRIVATE
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // console.log(req.user.profilepic.data);
    const TR = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilepic: req.user.profilepic
    }
    res.send(TR);
  }
);

module.exports = router;
