const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const fetch = require('node-fetch');
const multer = require("multer");
var fs = require('fs');
const path = require("path");
const News = require("../../setup/script");
router.use(express.static("./public"));

//Load Person Model
const Person = require("../../models/Person");

//Load Profile Model
const NewsPaper = require("../../models/Newspapers");



// @type    GET
//@route    /api/profile/
// @desc    route for personnal user profile
// @access  PRIVATE
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if (!profile) {
                    return res.status(404).json({ profilenotfound: "No profile Found" });
                }
                res.json(profile);
            })
            .catch(err => console.log("got some error in profile " + err));
    }
);

// @type    POST
//@route    /api/profile/
// @desc    route for UPDATING/SAVING personnal user profile
// @access  PRIVATE
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const profileValues = {};
        profileValues.user = req.user.id;
        if (req.body.username) profileValues.username = req.body.username;
        if (req.body.website) profileValues.website = req.body.website;
        if (req.body.country) profileValues.country = req.body.country;
        if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if (typeof req.body.languages !== undefined) {
            profileValues.languages = req.body.languages.split(",");
        }
        //get social links
        profileValues.social = {};

        if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
        if (req.body.instagram) profileValues.social.instagram = req.body.instagram;

        //Do database stuff
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if (profile) {
                    Profile.findOneAndUpdate(
                        { user: req.user.id },
                        { $set: profileValues },
                        { new: true }
                    )
                        .then(profile => res.json(profile))
                        .catch(err => console.log("problem in update" + err));
                } else {
                    Profile.findOne({ username: profileValues.username })
                        .then(profile => {
                            //Username already exists
                            if (profile) {
                                res.status(400).json({ username: "Username already exists" });
                            }
                            //save user
                            new Profile(profileValues)
                                .save()
                                .then(profile => res.json(profile))
                                .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log("Problem in fetching profile" + err));
    }
);



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
}).single("Jimage");

// @type    POST
//@route    /api/profile/News/userid
// @desc    route for UPDATING/SAVING personnel user profile
// @access  PRIVATE

router.post("/upload/:uid", (req, res) => {
    console.log("BC CHL KYO NI RHA")
    const id = req.params.uid
    upload(req, res, error => {
        if (error) {
            res.send("Failed")
            console.log("PIC NOT UPLOADED", error);
        } else {
            console.log("PIC UPLOAD Success");
            try {
                FN = `${req.file.filename}`
            }
            catch {
                res.send("Failed")
            }
            res.json(FN)
            console.log(FN)
        }
    });
});

router.post("/News/:userid/:papid", (req, res) => {

    var FN = req.body.imagename
    const id = req.params.userid;
    const Pid = req.params.papid;
    console.log("ID = ", id)
    console.log("PID = ", Pid)

    const NewPap = {}
    NewPap.User = req.params.userid;

    console.log("FINAL YHi HAI ->")
    console.log(FN)
    console.log(req.body.title)
    console.log(req.body.price)

    try {
        var XT = fs.readFileSync(path.join('public/myupload/' + FN));
    }
    catch {
        FN = "dafNews.jpg"
    }

    var Pap = {}
    Pap.Image = {}
    Pap.Image.data = fs.readFileSync(path.join('public/myupload/' + FN));
    Pap.Image.contentType = 'image/' + FN.split('.').pop()
    if (req.body.title) Pap.Title = req.body.title
    if (req.body.price) Pap.Price = req.body.price
    if (req.body.language) Pap.Language = req.body.language
    if (req.body.areacode) Pap.Areacode = req.body.areacode

    NewsPaper.findOne({ User: id })
        .then(profile => {
            if (profile) {
                if (Pid != "00") {
                    console.log(profile)

                    console.log("MAIN UPDATE")

                    const Updatethis = profile.Newspapers
                        .map(item => item.id)
                        .indexOf(Pid);

                    if (req.body.imagename == "No Change") {
                        Pap.Image.data = profile.Newspapers[Updatethis].Image.data;
                        Pap.Image.contentType = profile.Newspapers[Updatethis].Image.contentType;
                    }

                    console.log(Pap)
                    profile.Newspapers.splice(Updatethis, 1);
                    profile.Newspapers.unshift(Pap);
                    profile.save()
                        .then(profile => {
                            res.send("<script>if(confirm('Successfully Updated')) document.location = '/" + id + "';</script>")
                            //response
                        })
                        .catch(err => console.log(err));
                }
                else {

                    console.log("THA HUA YHA")
                    profile.Newspapers.unshift(Pap);
                    profile.save()
                        .then(profile => {
                            console.log(profile)
                            res.send("<script>if(confirm('Successfully Updated')) document.location = '/" + id + "';</script>")
                            //response
                        })
                        .catch(err => console.log(err));
                }
            }
            else {
                new NewsPaper(NewPap)
                    .save()
                    .then(profile => {
                        profile.Newspapers.unshift(Pap);
                        profile.save()
                            .then(profile => {
                                console.log(profile)
                                res.send("<script>if(confirm('Successfully Added')) document.location = '/" + id + "';</script>")
                                //response
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log("Problem in fetching profile" + err));
});


// @type    GET 
//@route    /api/profile/Delete/:uid/:pid
// @desc    route for UPDATING/SAVING personnel user profile
// @access  PRIVATE


router.get("/Delete/:userid/:papid", (req, res) => {

    const id = req.params.userid;
    const Pid = req.params.papid;

    NewsPaper.findOne({ User: id })
        .then(profile => {
            if (profile) {
                const Updatethis = profile.Newspapers
                    .map(item => item.id)
                    .indexOf(Pid);

                profile.Newspapers.splice(Updatethis, 1)
                profile.save()
                    .then(profile => {
                        res.send("<script>if(confirm('Successfully Updated')) document.location = '/" + id + "';</script>")
                        //response
                    })
                    .catch(err => console.log(err));
            }
            else {
                res.send("<script>if(confirm('Not Found')) document.location = '/" + id + "';</script>")
            }
        })
        .catch(err => console.log("Problem in fetching profile" + err));
});


// @type    POST
//@route    /api/profile/update/userid
// @desc    route for UPDATING/SAVING personnel user profile
// @access  PRIVATE

router.post("/update/:userid", (req, res) => {

    const newPerson = {}
    if (req.body.user.mobile) newPerson.mobile = req.body.user.mobile
    if (req.body.user.areacode) newPerson.areacode = req.body.user.areacode
    if (req.body.user.address) newPerson.address = req.body.user.address

    //Do database stuff
    var id = req.params.userid;
    Person.findById(id)
        .then(person => {
            if (person) {
                console.log("Person MIL THA")
                Person.updateOne(
                    { _id: person.id },
                    { $set: newPerson },
                    { new: true }
                )
                    .then(person => {
                        console.log(person)
                        res.redirect("/" + id)
                    })
                    .catch(err => console.log("problem in update" + err));
            }
            else {
                console.log("USER NOT FOUND")
            }
        })
        .catch(err => console.log("Problem in fetching profile" + err));
}
);

// @type    POST
//@route    /api/profile/delete/userid
// @desc    route for UPDATING/SAVING personnel user profile
// @access  PRIVATE

router.get("/delete/:userid", (req, res) => {

    //Do database stuff
    var id = req.params.userid;
    Person.findById(id)
        .then(person => {
            if (person) {
                console.log("Person MIL THA")
                Person.findOneAndRemove({ _id: person.id })
                    .then(person => {
                        console.log(person)
                        res.redirect("/")
                    })
                    .catch(err => console.log("problem in update" + err));
            }
            else {
                console.log("USER NOT FOUND")
            }
        })
        .catch(err => console.log("Problem in fetching profile" + err));
}
);

// @type    GET
//@route    /api/profile/:userid
// @desc    route for getting user profile based on USERNAME
// @access  PUBLIC

router.get("/:userid", (req, res) => {
    var id = req.params.userid;
    Person.findById(id)
        .then(person => {
            if (!person) {
                res.status(404).json({ usernotfound: "User not found" });
            }
            if (person.usertype == 'Vendor') {
                console.log(id)
                NewsPaper.findOne({ User: person._id })
                    .then(NewsPap => {
                        if (!NewsPap) {
                            console.log("No NEWS BITCh")
                        }
                        const Aunty = {
                            person,
                            NewsPap
                        }
                        console.log("FOUND NEWS")
                        console.log(Aunty)
                        res.send(Aunty)
                    })
                    .catch(err => console.log("Error in fetching username " + err))
            }
            else {
                const NewsPap = {}
                const Aunty = {
                    person,
                    NewsPap
                }
                res.send(Aunty)
                // console.log(person);
                // res.render("Profile", person);
            }

        })
        .catch(err => console.log("Error in fetching username " + err));
});


// @type    GET
//@route    /api/profile/find/everyone
// @desc    route for getting user profile of EVERYONE
// @access  PUBLIC
router.get("/find/everyone", (req, res) => {
    Profile.find()
        .populate("user", ["name", "profilepic"])
        .then(profiles => {
            if (!profiles) {
                res.status(404).json({ usernotfound: "NO profile was found" });
            }
            res.json(profiles);
        })
        .catch(err => console.log("Error in fetching username " + err));
});


// @type    GET
//@route    /api/profile/NewsOffers
// @desc    route for getting user profile of EVERYONE
// @access  PUBLIC
router.get("/NewsOffers/:Pin", (req, res) => {

    const PID = req.params.Pin
    if (PID == "-100") {
        console.log("ALL OFFERS")
        NewsPaper.find()
            .populate("User", ["name", "email", "mobile"])
            .then(profiles => {
                if (!profiles) {
                    res.status(404).json({ usernotfound: "NO profile was found" });
                }
                // console.log(profiles)
                const off = {
                    offers: profiles
                }
                res.json(off);
            })
            .catch(err => console.log("Error in fetching username " + err));
    }
    else {
        console.log("Offers on " + PID)
        NewsPaper.find({ "Newspapers.Areacode": { $eq: PID } })
            .populate("User", ["name", "email", "mobile"])
            .then(profiles => {
                if (!profiles) {
                    res.status(404).json({ usernotfound: "NO profile was found" });
                }
                for (i = 0; i < profiles.length; i++) {
                    for (j = 0; j < profiles[i].Newspapers.length; j++) {
                        if (profiles[i].Newspapers[j].Areacode != PID) {
                            delete profiles[i].Newspapers[j];
                        }
                    }
                    profiles[i].Newspapers = profiles[i].Newspapers.filter(function (el) {
                        return el != null;
                    });
                }

                // console.log(profiles)
                const off = {
                    offers: profiles
                }
                res.json(off);
            })
            .catch(err => console.log("Error in fetching username " + err));
    }

});


// @type    DELETE
//@route    /api/profile/
// @desc    route for deleting user based on ID
// @access  PRIVATE

router.delete(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id });
        Profile.findOneAndRemove({ user: req.user.id })
            .then(() => {
                Person.findOneAndRemove({ _id: req.user.id })
                    .then(() => res.json({ success: "delete was a success" }))
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
);

// @type    POST
//@route    /api/profile/workrole
// @desc    route for adding work profile of a person
// @access  PRIVATE

router.post(
    "/workrole",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                //assignment
                const newWork = {
                    role: req.body.role,
                    company: req.body.company,
                    country: req.body.country,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    details: req.body.details
                };
                profile.workrole.unshift(newWork);
                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
);

// @type    DELETE
//@route    /api/profile/workrole/:w_id
// @desc    route for deleting a specific workrole
// @access  PRIVATE
router.delete(
    "/workrole/:w_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                //assignemnt to check if we got a profile
                const removethis = profile.workrole
                    .map(item => item.id)
                    .indexOf(req.params.w_id);

                profile.workrole.splice(removethis, 1);

                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
);

//Assignemnt - create a route to delete all elements from array and save that in database

module.exports = router;
