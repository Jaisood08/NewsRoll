const express = require("express");
const ejs = require("ejs");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
const fetch = require('node-fetch');


const Person = require("./models/Person");

const News = require("./setup/script")

//MULTER PATh
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/myupload");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});


var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
}).single("profilepic");


//bring all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");


const app = express();
const port = process.env.PORT || 3000;

//set for ejs
app.set("view engine", "ejs");
// static folder
app.use(express.static("./public"));

//ProPic Upload Route

app.post("/upload", (req, res) => {
    upload(req, res, error => {
        if (error) {
            res.render("Register", {
                message: error
            });
        } else {
            console.log(req.file.filename)
            res.render("Register", {
                message: "Successfully uploaded...",
                filename: 'myupload/' + req.file.filename
            });
        }
    });
});


//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

//mongoDB configuration
const db = require("./setup/myurl").mongoURL;

//Attempt to connect to database
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => {
        console.log("******  Some Error in DB connection **********")
        console.log(err)
    });

//Passport middleware
app.use(passport.initialize());

//Config for JWT strategy
require("./strategies/jsonwtStrategy")(passport);






//actual routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/Login", (req, res) => {
    res.render("Login");
});


app.get("/AboutUs", (req, res) => {
    res.render('About', News);
});

app.get("/Register", (req, res) => {
    res.render("Register");
});

app.get("/test", (req, res) => {
    res.json({ name: "jay" })
});

app.get("/panelcart", (req, res) => {
    res.send("<%-include('PanelCart')%>")
});

app.get("/cart", (req, res) => {
    res.render("ManageNewspapers")
});
app.get("/Contact", (req, res) => {
    res.render("Contact")
});

// var LDEP = "http://localhost:3000";
var LDEP = "https://newsroll.herokuapp.com";


app.get("/:userid", (req, res) => {

    var id = req.params.userid;

    if (id.length >= 8) {

        var il = LDEP + "/api/profile/" + id
        fetch(il)
            .then(res => res.json())
            .then(json => {

                json.person.profilepic.data.data = Buffer.from(json.person.profilepic.data.data).toString('base64')
                console.log("YHA PE")
                console.log(json.NewsPap)

                if (json.person.usertype == "Vendor" && json.NewsPap != null) {
                    arr = json.NewsPap.Newspapers
                    // console.log(arr)
                    for (var i = 0; i < json.NewsPap.Newspapers.length; i++) {
                        json.NewsPap.Newspapers[i].Image.data.data = Buffer.from(json.NewsPap.Newspapers[i].Image.data.data).toString('base64')
                        // console.log(json.NewsPap.Newspapers[i].Image)
                    }
                }
                console.log(json)
                res.render("Profile", json)
            });

    }
    // ///////
    else {
        var ilo = LDEP + "/api/profile/NewsOffers/" + id
        fetch(ilo)
            .then(res => res.json())
            .then(json => {
                arr = json
                // console.log(arr)
                for (var i = 0; i < json.offers.length; i++) {
                    for (var j = 0; j < json.offers[i].Newspapers.length; j++) {
                        json.offers[i].Newspapers[j].Image.data.data = Buffer.from(json.offers[i].Newspapers[j].Image.data.data).toString('base64')
                    }
                }
                console.log(json)
                res.render("NewsOffers", json)
                // res.send(off)
            });
    }
});



app.use("/api/auth", auth);
app.use("/api/questions", questions);
app.use("/api/profile", profile);


app.listen(port, () => console.log(`App is running at ${port}`));